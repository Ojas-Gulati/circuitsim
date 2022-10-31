const epsilon = 0.000000000001;
const _LINEAR = "linear"

const opList = {
    "+": (x, y) => x + y,
    "-": (x, y) => x - y,
    "/": (x, y) => x / y,
    "*": (x, y) => x * y
}

class Expression {
    #cloneCoeffs(from) {
        for (let [key, val] of from) {
            this.#updateCoeff(key, val);
        }
    }
    #updateCoeff(key, value) {
        if (Math.abs(value) < epsilon && key !== _LINEAR) { this.coeffs.delete(key) }
        else this.coeffs.set(key, value)
    }
    #combine(expression, op) {
        if (expression.isLinear) {
            for (let [key, rhsVal] of expression.coeffs) {
                let lhsVal = this.coeffs.get(key)
                if (lhsVal === undefined) lhsVal = 0;
                this.#updateCoeff(key, op(lhsVal, rhsVal));
            }
        }
        else if (typeof expression === "number") {
            this.updateCoeff(_LINEAR, op(this.coeffs.get(_LINEAR), expression))
        }
        else {
            throw new Error("Internal combination error");
        }
    }
    #lin_add(expression) {
        this.#combine(expression, (x, y) => x + y)
    }
    #lin_sub(expression) {
        this.#combine(expression, (x, y) => x - y)
    }
    #lin_mul(number) {
        for (let [key, val] of this.coeffs) {
            this.#updateCoeff(key, val * number);
        }
    }
    #lin_div(number) {
        if (Math.abs(number) < epsilon) throw new Error("MathError: division by zero");
        for (let [key, val] of this.coeffs) {
            this.#updateCoeff(key, val / number);
        }
    }
    checkForSimplification() {
        // TODO: keepTree should be used here. also what are we doing with leaves
        // only does this on the level being checked for
        if (this.tree != null) {
            // there's some hope of simplifying
            if (this.tree.lhs.solved && this.tree.rhs.solved) {
                // execute op
                this.isLinear = true;
                this.coeffs.set(_LINEAR, opList[this.tree.op](this.tree.lhs.numericValue, this.tree.rhs.numericValue))
            }
            else if (this.tree.lhs.isLinear && this.tree.rhs.isLinear) {
                // can try to execute add and sub ops
                this.isLinear = true;
                if (this.tree.op == "+" || this.tree.op == "-") {
                    this.#cloneCoeffs(this.tree.lhs.coeffs);
                    if (this.tree.op == "+") this.#lin_add(this.tree.rhs)
                    else this.#lin_sub(this.tree.rhs);
                }
                else if (this.tree.op == "*" && this.tree.lhs.solved) {
                    this.#cloneCoeffs(this.tree.rhs.coeffs);
                    this.#lin_mul(this.tree.lhs.numericValue);
                }
                else if (this.tree.rhs.solved) {
                    this.#cloneCoeffs(this.tree.lhs.coeffs);
                    if (this.tree.op == "*") this.#lin_mul(this.tree.rhs.numericValue)
                    else if (this.tree.op == "/") this.#lin_div(this.tree.rhs.numericValue);
                }
            }
        }
    }
    constructor(value, keepTree = false) {
        let _construct = (val) => {
            this.isVariable = false;
            this.coeffs = new Map();
            this.coeffs.set(_LINEAR, 0);
            this.dependencies = [];
            this.keepTree = keepTree;
            if (val === null) {
                // should only be done through Variable constructor
                this.isLinear = true;
                this.tree = null;
                this.leaf = true;
            }
            else if (typeof val === "number") {
                this.isLinear = true;
                this.tree = null;
                this.leaf = true;
                this.coeffs.set(_LINEAR, val);
            }
            else if (typeof val === "object" && (val ?? {}).hasOwnProperty("op")) {
                // construct as a tree
                this.isLinear = false;
                this.tree = val;
                this.leaf = false;
                this.checkForSimplification()
            }
            else {
                console.log(val);
                throw new Error("val passed to Expression constructor not number or expression (not currently supported)")
            }
        }

        _construct(value);
    }
    #performOperation(expr, op, keepTree) {
        let exp = expr;
        if (!(exp instanceof Expression)) {
            exp = new Expression(expr);
        }
        let newtree = {
            "op": op,
            "lhs": this,
            "rhs": exp
        }
        let toreturn = new Expression(newtree)
        return toreturn;
    }
    add(expr, keepTree = false) {
        return this.#performOperation(expr, "+", keepTree);
    }
    sub(expr, keepTree = false) {
        return this.#performOperation(expr, "-", keepTree);
    }
    div(expr, keepTree = false) {
        return this.#performOperation(expr, "/", keepTree);
    }
    mul(expr, keepTree = false) {
        return this.#performOperation(expr, "*", keepTree);
    }

    toString() {
        if (this.isLinear) {
            let str = "";
            for (let [key, rhsVal] of this.coeffs) {
                if (key != _LINEAR) {
                    str += rhsVal + key.toString() + " + ";
                }
            }
            str += this.coeffs.get(_LINEAR);
            return str;
        }
        else if (this.tree != null) {
            return "(" + this.tree.lhs.toString() + ") " + this.tree.op + " (" + this.tree.rhs.toString() + ")";
        }
        else {
            return "ERR";
        }
    }

    get solved() {
        if (this.coeffs.size === 1 && this.isLinear) {
            return true;
        }
        return false;
    }
    get numericValue() {
        if (this.solved) {
            return this.coeffs.get(_LINEAR);
        }
        else {
            return null;
        }
    }
}

class Variable extends Expression {
    constructor(name, variableStore) {
        super(null);
        this.name = name;
        this.isVariable = true;
        this.isLinear = true;
        this.coeffs.set(this, 1);

        if (variableStore !== undefined) {
            variableStore[this.name] = this;
        }
    }
    toString() {
        return this.name;
    }
}

class Equation {
    constructor(leftExpr, rightExpr) {
        this.lhs = leftExpr;
        this.rhs = rightExpr;
    }
}