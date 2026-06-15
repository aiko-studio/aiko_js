const generateLiteral = require('./generateLiteral');
const generateBinaryOp = require('./generateBinaryOp');
const generateIdentifier = require('./generateIdentifier');
const generateArrayLiteral = require('./generateArrayLiteral');
const generateArrayAccess = require('./generateArrayAccess');
const generateInput = require('./generateInput');
const generateTypeof = require('./generateTypeof');
const generateUnaryOp = require('./generateUnaryOp');
const handleFunCall = require('../statements/handleFunCall');
const handleLen = require('./generateLen');
const generateArrayAlloc = require('./generateArrayAlloc');
const generateView = require('./generateView');

const expressionHandler = {
  	'Literal':      (self, expr, mode) => generateLiteral(self, expr, mode),
  	'BinaryOp':     (self, expr, mode) => generateBinaryOp(self, expr, mode),
  	'UnaryOp':      (self, expr)       => generateUnaryOp(self, expr),
  	'Identifier':   (self, expr)       => generateIdentifier(self, expr),
  	'FunctionCall': (self, expr)       => handleFunCall(self, expr),
  	'ArrayLiteral': (self, expr)       => generateArrayLiteral(self, expr),
  	'ArrayAccess':  (self, expr)       => generateArrayAccess(self, expr),
  	'Input':        (self, expr)       => generateInput(self, expr),
  	'Typeof':       (self, expr)       => generateTypeof(self, expr),
	'Len':			(self, expr)	   => handleLen(self, expr),
	'ArrayAlloc':	(self, expr)	   => generateArrayAlloc(self, expr),
	'View':			(self, expr)	   => generateView(self, expr),
};

module.exports = expressionHandler;