import WorkerStorage from '../src/worker-storage';

describe('WorkerStorage', function () {
  describe('constructor', function () {
    it('should return an instance', function () {
      const workerStorage = new WorkerStorage();
      assert.isTrue(workerStorage.map instanceof Map);
      assert.isTrue(workerStorage.length === 0);
    });
  });

  describe('key', function () {
    it('should return one', function () {
      const workerStorage = new WorkerStorage();
      workerStorage.setItem('0', 'zero');
      workerStorage.setItem('1', 'one');
      assert.isTrue(workerStorage.key(1) === 'one');
    });
  });

  describe('setItem/getItem', function () {
    it('should assign and return zero', function () {
      const workerStorage = new WorkerStorage();
      workerStorage.setItem('0', 'zero');
      assert.isTrue(workerStorage.getItem('0') === 'zero');
    });
  });

  describe('removeItem', function () {
    it('should remove single item', function () {
      const workerStorage = new WorkerStorage();
      workerStorage.setItem('0', 'zero');
      workerStorage.removeItem('0');
      assert.isTrue(workerStorage.getItem('0') === undefined);
    });
  });

  describe('clear', function () {
    it('should clear storage', function () {
      const workerStorage = new WorkerStorage();
      workerStorage.setItem('0', 'zero');
      workerStorage.setItem('1', 'one');
      workerStorage.clear();
      assert.isTrue(workerStorage.getItem('0') === undefined);
      assert.isTrue(workerStorage.getItem('1') === undefined);
    });
  });
});
