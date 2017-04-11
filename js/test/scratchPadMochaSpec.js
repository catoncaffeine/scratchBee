var assert = require('assert');
describe("first mocha test", function(){
    it("fails because 1 does not equal to 2", function(){
        assert.equals(1, 2);
    });
});