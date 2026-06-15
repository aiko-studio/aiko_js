class ProgramStmt {
    constructor(statements){
        this.type = 'Program';
        this.statements = statements;
    }
}

// variabel
class VarDeclStmt {
    constructor(kind, name, initializer, lineStart, lineEnd){
        this.type = 'VarDecl';
        this.kind = kind;
        this.name = name;
        this.initializer = initializer;
        this.lineStart = lineStart;
        this.lineEnd = lineEnd;
    }
};


// assign
class AssignmentStmt {
    constructor(variable, initializer, lineStart, lineEnd){
        this.type = 'Assign';
        this.variable = variable;
        this.initializer = initializer;
        this.lineStart = lineStart;
        this.lineEnd = lineEnd;
    }
};


// print
class PrintStmt {
    constructor(expression, lineStart, lineEnd){
        this.type = 'Print';
        this.expression = expression;
        this.lineStart = lineStart;
        this.lineEnd = lineEnd;
    }
};


// if elif else
class IfStmt {
    constructor(condition, then_block, elifs, else_block, lineStart, lineEnd){
        this.type = 'If';
        this.condition = condition;
        this.then_block = then_block;
        this.elifs = elifs;             // list of else
        this.else_block = else_block;
        this.lineStart = lineStart;
        this.lineEnd = lineEnd;
    }
};

class ElifStmt {
    constructor(condition, block, lineStart, lineEnd){
        this.type = 'Elif';
        this.condition = condition;
        this.block = block;
        this.lineStart = lineStart;
        this.lineEnd = lineEnd;
    }
};


// for loop
class ForStmt {
    constructor(iterator, endExpr, step, block, lineStart, lineEnd){
        this.type = 'For';
        this.iterator = iterator;
        this.endExpr = endExpr;
        this.step = step;
        this.block = block;
        this.lineStart = lineStart;
        this.lineEnd = lineEnd;
    }
}

// array
class ArrayLiteralStmt {
    constructor(elements, lineStart, lineEnd){
        this.type = 'ArrayLiteral';
        this.elements = elements;
        this.lineStart = lineStart;
        this.lineEnd = lineEnd;
    }
};

class ArrayAccessStmt {
    constructor(array_name, index, lineStart, lineEnd){
        this.type = 'ArrayAccess';
        this.array_name = array_name;
        this.index = index;
        this.lineStart = lineStart;
        this.lineEnd = lineEnd;
    }
};


// fungsi
class FunctionDeclStmt {
    constructor(name, params, body, lineStart, lineEnd){
        this.type = 'FunctionDecl';
        this.name = name;
        this.params = params;
        this.body = body;
        this.lineStart = lineStart;
        this.lineEnd = lineEnd;
    }
};

class ReturnStmt {
    constructor(value, lineStart, lineEnd){
        this.type = 'Return';
        this.value = value;
        this.lineStart = lineStart;
        this.lineEnd = lineEnd;
    }
};


// ekspresi
class BinaryOpStmt {
    constructor(left, op, right, lineStart, lineEnd){
        this.type = 'BinaryOp';
        this.left = left;
        this.op = op;
        this.right = right;
        this.lineStart = lineStart;
        this.lineEnd = lineEnd;
    }
};

class UnaryOpStmt {
    constructor(op, operand, lineStart, lineEnd){
        this.type = 'UnaryOp';
        this.op = op;
        this.operand = operand;
        this.lineStart = lineStart;
        this.lineEnd = lineEnd;
    }
}

class LiteralStmt {
    constructor(value, lineStart, lineEnd){
        this.type = 'Literal';
        this.value = value;
        this.lineStart = lineStart;
        this.lineEnd = lineEnd;
    }
};

class IdentifierStmt {
    constructor(name, lineStart, lineEnd, modulePrefix = null){
        this.type = 'Identifier';
        this.name = name;
        this.lineStart = lineStart;
        this.lineEnd = lineEnd;
        this.modulePrefix = modulePrefix;
    } 
};

class FunctionCallStmt {
    constructor(name, args, lineStart, lineEnd){
        this.type = 'FunctionCall';
        this.name = name;
        this.args = args;
        this.lineStart = lineStart;
        this.lineEnd = lineEnd;
    }
};

class TypeofStmt {
    constructor(expression, lineStart, lineEnd){
        this.type = 'Typeof';
        this.expression = expression;
        this.lineStart = lineStart;
        this.lineEnd = lineEnd;
    }
}

class InputStmt {
    constructor(print, data_type, lineStart, lineEnd){
        this.type = 'Input';
        this.print = print;
        this.data_type = data_type;
        this.lineStart = lineStart;
        this.lineEnd = lineEnd;
    }
}

class UseStmt {
    constructor(modulee, alias = null, lineStart, lineEnd){
        this.type = 'Use';
        this.module = modulee;
        this.alias = alias;
        this.lineStart = lineStart;
        this.lineEnd = lineEnd;
    }
}

class LenStmt {
    constructor(expression, lineStart, lineEnd){
        this.type = 'Len';
        this.expression = expression;
        this.lineStart = lineStart;
        this.lineEnd = lineEnd;
    }
}

class BreakStmt {
    constructor(line){
        this.type = 'Break';
        this.lineStart = line;
    }
}

class ContinueStmt {
    constructor(line){
        this.type = 'Continue';
        this.lineStart = line;
    }
}

class ArrayAllocStmt {
    constructor(size, lineStart, lineEnd) {
        this.type = 'ArrayAlloc';
        this.size = size; 
        this.lineStart = lineStart;
        this.lineEnd = lineEnd;
    }
}

class PushStmt {
    constructor(arrayRef, value, lineStart, lineEnd) {
        this.type = 'Push';
        this.arrayRef = arrayRef;
        this.value = value;      
        this.lineStart = lineStart;
        this.lineEnd = lineEnd;
    }
}

class PopStmt {
    constructor(arrayRef, lineStart, lineEnd) {
        this.type = 'Pop';
        this.arrayRef = arrayRef;
        this.lineStart = lineStart;
        this.lineEnd = lineEnd;
    }
}

class ViewStmt {
    constructor(argument, lineStart, lineEnd) {
        this.type = 'View';
        this.argument = argument; // Ini adalah IdentifierStmt dari variabel 'x'
        this.lineStart = lineStart;
        this.lineEnd = lineEnd;
    }
}


module.exports = {
    ProgramStmt,
    VarDeclStmt,
    AssignmentStmt,
    PrintStmt,
    IfStmt,
    ElifStmt,
    ForStmt,
    ArrayLiteralStmt,
    ArrayAccessStmt,
    FunctionDeclStmt,
    ReturnStmt,
    BinaryOpStmt,
    UnaryOpStmt,
    LiteralStmt,
    IdentifierStmt,
    FunctionCallStmt,
    TypeofStmt,
    InputStmt,
    UseStmt,
    LenStmt,
    BreakStmt,
    ContinueStmt,
    ArrayAllocStmt,
    PushStmt,
    PopStmt,
    ViewStmt
};