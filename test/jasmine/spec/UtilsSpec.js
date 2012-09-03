describe("nextHighestPowerOfTwo", function() {
    it("shows that the next highest POT from 5 is 8 ", function() {
        expect(vixgl.util.nextHighestPowerOfTwo(5)).toEqual(8);
    });

    it("shows that the next highest POT from 8 is 16 (even though 8 is a POT) ", function() {
        expect(vixgl.util.nextHighestPowerOfTwo(5)).toEqual(8);
    });
});

describe("isPowerOfTwo", function() {
    it("shows that 4 is a power of two", function() {
        expect(vixgl.util.isPowerOfTwo(4)).toEqual(true);
    });

    it("shows that 5 is not a power of two", function() {
        expect(vixgl.util.isPowerOfTwo(5)).toEqual(false);
    });
});

describe("getQueryStringParams", function() {
    it("pulls the right param from a url", function() {
        var url = 'http://www.google.com?q=wibble&foo=bar&jasmine=ace';
        var param = 'jasmine';
        expect(vixgl.util.getQueryStringParam(url, param)).toEqual('ace');
    });

    it("returns undefined when a param isnt present", function() {
        var url = 'http://www.google.com?q=wibble&foo=bar&jasmine=ace';
        var param = 'nyan';
        expect(vixgl.util.getQueryStringParam(url, param)).toBeUndefined();
    });
});

