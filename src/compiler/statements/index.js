const handlePrint = require('./handlePrint');
const handleVarDecl = require('./handleVarDecl');
const handleIf = require('./handleIf');
const handleFor = require('./handleFor');
const handleAssign = require('./handleAssign');
const handleFunCall = require('./handleFunCall');
const handleFunDecl = require('./handleFunDecl');
const handleUse = require('./handleUse');
const handleReturn = require('./handleReturn');
const handleContinue = require('./handleContinue');
const handleBreak = require('./handleBreak');
const handlePush = require('./handlePush');
const handlePop = require('./handlePop');

const statementHandlers = {
    'Print':        (self, stmt) => handlePrint(self, stmt),
  	'VarDecl':      (self, stmt) => handleVarDecl(self, stmt),
  	'Assign':       (self, stmt) => handleAssign(self, stmt),
  	'If':           (self, stmt) => handleIf(self, stmt),
  	'For':          (self, stmt) => handleFor(self, stmt),
  	'Use':          (self, stmt) => handleUse(self, stmt),
  	'FunctionDecl': (self, stmt) => handleFunDecl(self, stmt),
  	'FunctionCall': (self, stmt) => handleFunCall(self, stmt),
  	'Return':       (self, stmt) => handleReturn(self, stmt),
  	'Break':        (self, stmt) => handleBreak(self, stmt),
  	'Continue':     (self, stmt) => handleContinue(self, stmt),
  	'Push':    		(self, stmt) => handlePush(self, stmt),
  	'Pop':     		(self, stmt) => handlePop(self, stmt),
};

module.exports = statementHandlers;