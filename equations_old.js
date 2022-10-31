class Equation {
    constructor(leftExpr, rightExpr) {
        this.lhs = leftExpr;
        this.rhs = rightExpr;
    }
}

class _intermediateExpression {
    constructor(lhs, op) {
        this.lhs = lhs;
        this.op = op;
    }
    _(rhs) {
        console.log(this.lhs, rhs, this.op)
        // rhs of expression
        let newExpression = new Expression({
            "solved": false,
            "tree": {
                "op": this.op,
                "lhs": this.lhs,
                "rhs": rhs
            }
        });
        this.lhs.dependents.push(newExpression);
        rhs.dependents.push(newExpression);
        return newExpression;
    }
}

// expressions have trees which represent their relation to other variables
// they also have "solved trees", which efficiently updates progress on the current solution
class Expression {
    #setValue(value, updateFullTree) {
        if (value !== null && value.hasOwnProperty("solved")) {
            console.log(value);
            this.solved = value.solved;
            if (updateFullTree) this.tree = value.tree;
            this.solvedValue = this.solved ? value.tree : null;
        }
        else {
            this.solved = typeof (value) === "number";
            if (updateFullTree) this.tree = value;
            this.solvedValue = this.solved ? value : null;
        }
    }

    #propagateSolution() {
        if (this.solved) {
            for (let dependent of this.dependents) {
                dependent.updateTree();
            }
        }
    }
    constructor(value) {
        this.#setValue(value, true)
        this.dependents = []
    }
    _(operator) {
        // combine expressions
        // operators so far can be +, -, /, *
        return new _intermediateExpression(this, operator);
    }
    updateValue(value) {
        this.#setValue(value, true);
        this.#propagateSolution();
    }
    updateSolution(value) {
        this.#setValue(value, false);
        this.#propagateSolution();
    }
    updateTree() {
        // check if the top level of the tree is two solved expressions, and if so execute op to solve
        if (this.tree.lhs.solved && this.tree.rhs.solved) {
            this.updateSolution(eq_operators[this.tree.op](this.tree.lhs.solvedValue, this.tree.rhs.solvedValue))
        }
    }
}