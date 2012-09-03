// http://evanhahn.com/?p=181 How Do I Jasmine #halp
// https://github.com/pivotal/jasmine/wiki Jasmine GH wiki #halp

describe("handleKeys", function() {

    beforeEach(function() {
       vixgl.util.currentlyPressedKeys = [];
       vixgl.camera.pitchRate = 0;
       vixgl.camera.yawRate = 0;
       vixgl.camera.speed = 0;
    });

    it("will change only the pitch rate when 1 is pressed ", function() {
        vixgl.util.currentlyPressedKeys[KEYS.ONE] = 1;        

        vixgl.camera.handleKeys();

        expect(vixgl.camera.pitchRate).toEqual(0.001);
        expect(vixgl.camera.yawRate).toEqual(0);
        expect(vixgl.camera.speed).toEqual(0);
    });

    it("will change only the pitch rate when 2 is pressed ", function() {
        vixgl.util.currentlyPressedKeys[KEYS.TWO] = 1;        

        vixgl.camera.handleKeys();

        expect(vixgl.camera.pitchRate).toEqual(-0.001);
        expect(vixgl.camera.yawRate).toEqual(0);
        expect(vixgl.camera.speed).toEqual(0);
    });

    it("will change only the yaw rate when left key is pressed ", function() {
        vixgl.util.currentlyPressedKeys[KEYS.LEFT] = 1;        

        vixgl.camera.handleKeys();

        expect(vixgl.camera.pitchRate).toEqual(0);
        expect(vixgl.camera.yawRate).toEqual(0.001);
        expect(vixgl.camera.speed).toEqual(0);
    });

    it("will change only the yaw rate when A is pressed ", function() {
        vixgl.util.currentlyPressedKeys[KEYS.A] = 1;        

        vixgl.camera.handleKeys();

        expect(vixgl.camera.pitchRate).toEqual(0);
        expect(vixgl.camera.yawRate).toEqual(0.001);
        expect(vixgl.camera.speed).toEqual(0);
    });

    it("will change only the yaw rate when right key is pressed ", function() {
        vixgl.util.currentlyPressedKeys[KEYS.RIGHT] = 1;        

        vixgl.camera.handleKeys();

        expect(vixgl.camera.pitchRate).toEqual(0);
        expect(vixgl.camera.yawRate).toEqual(-0.001);
        expect(vixgl.camera.speed).toEqual(0);
    });

    it("will change only the yaw rate when D is pressed ", function() {
        vixgl.util.currentlyPressedKeys[KEYS.D] = 1;        

        vixgl.camera.handleKeys();

        expect(vixgl.camera.pitchRate).toEqual(0);
        expect(vixgl.camera.yawRate).toEqual(-0.001);
        expect(vixgl.camera.speed).toEqual(0);
    });

    it("will change only the speed when up key is pressed ", function() {
        vixgl.util.currentlyPressedKeys[KEYS.UP] = 1;        

        vixgl.camera.handleKeys();

        expect(vixgl.camera.pitchRate).toEqual(0);
        expect(vixgl.camera.yawRate).toEqual(0);
        expect(vixgl.camera.speed).toEqual(0.003);
    });

    it("will change only the speed when W is pressed ", function() {
        vixgl.util.currentlyPressedKeys[KEYS.W] = 1;        

        vixgl.camera.handleKeys();

        expect(vixgl.camera.pitchRate).toEqual(0);
        expect(vixgl.camera.yawRate).toEqual(0);
        expect(vixgl.camera.speed).toEqual(0.003);
    });

    it("will change only the speed when down key is pressed ", function() {
        vixgl.util.currentlyPressedKeys[KEYS.DOWN] = 1;        

        vixgl.camera.handleKeys();

        expect(vixgl.camera.pitchRate).toEqual(0);
        expect(vixgl.camera.yawRate).toEqual(0);
        expect(vixgl.camera.speed).toEqual(-0.003);
    });

    it("will change only the speed when S is pressed ", function() {
        vixgl.util.currentlyPressedKeys[KEYS.S] = 1;        

        vixgl.camera.handleKeys();

        expect(vixgl.camera.pitchRate).toEqual(0);
        expect(vixgl.camera.yawRate).toEqual(0);
        expect(vixgl.camera.speed).toEqual(-0.003);
    });

});

describe("updateSceneForCamera", function() {
    beforeEach(function() {
       mat4 = {}; // this probs isn't how you're supposed to manage ext deps :S
       mat4.rotate = jasmine.createSpy('rotate spy for updateSceneForCamera');
       mat4.translate = jasmine.createSpy('translate spy for updateSceneForCamera');
    });

    it("will move the camera based on the current camera settings", function() {
        var mvMatrix;
        vixgl.camera.pitch = 4;
        vixgl.camera.yaw   = 5;
        vixgl.camera.xPos  = 1;
        vixgl.camera.yPos  = 2;
        vixgl.camera.zPos  = 3;

        vixgl.camera.updateSceneForCamera(mvMatrix);

        expect(mat4.rotate).toHaveBeenCalledWith(mvMatrix, -4, [1,0,0]);
        expect(mat4.rotate).toHaveBeenCalledWith(mvMatrix, -5, [0,1,0]);
        expect(mat4.translate).toHaveBeenCalledWith(mvMatrix, [-1, -2, -3]);
    });

});

describe("updateViewingAngle", function() {
    beforeEach(function() {
       mat4 = {}; // this probs isn't how you're supposed to manage ext deps :S
       mat4.rotate = jasmine.createSpy('rotate spy for updateViewingAngle');
       mat4.translate = jasmine.createSpy('translate spy for updateViewingAngle');
    });

    it("will update the camera position only if we're moving", function() {
        var mvMatrix;
        vixgl.camera.speed     = 0;
        vixgl.camera.pitch     = 4;
        vixgl.camera.yaw       = 5;
        vixgl.camera.pitchRate = 10;
        vixgl.camera.yawRate   = 20;
        vixgl.camera.xPos      = 1;
        vixgl.camera.yPos      = 2;
        vixgl.camera.zPos      = 3;

        vixgl.camera.updateViewingAngle(10);

        expect(vixgl.camera.xPos).toEqual(1);
        expect(vixgl.camera.yPos).toEqual(2);
        expect(vixgl.camera.zPos).toEqual(3);
        expect(vixgl.camera.yaw).toEqual(205);
        expect(vixgl.camera.pitch).toEqual(104);

        vixgl.camera.speed = 5;

        vixgl.camera.updateViewingAngle(10);

        expect(vixgl.camera.xPos).toEqual(36.744875388388216);
        expect(vixgl.camera.yPos).toEqual(2);
        expect(vixgl.camera.zPos).toEqual(37.96146283364868);
        expect(vixgl.camera.yaw).toEqual(405);
        expect(vixgl.camera.pitch).toEqual(204);
    });
});

