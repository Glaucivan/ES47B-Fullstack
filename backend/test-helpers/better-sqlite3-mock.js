class FakeDatabase {
  constructor(path, options) {
    // console.log("Usando FakeDatabase para", path);
  }

  // usado no código para configurar o banco (WAL, cache, etc.)
  pragma(_statement) {
    // testes
    return;
  }

  // prepara queries
  prepare() {
    return {
      all: () => [],
      get: () => null,
      run: () => {},
    };
  }
}

// Export default em ESM
export default FakeDatabase;
