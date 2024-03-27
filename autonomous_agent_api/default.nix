{ lib
, python
, poetry2nix
}:

poetry2nix.mkPoetryApplication {
  inherit python;

  projectDir = ./.;
  pyproject = ./pyproject.toml;
  poetrylock = ./poetry.lock;

  pythonImportsCheck = [ "backend" ];

  meta = with lib; {
    homepage = "";
    description = "Backend for Autonomous Agent Testing .This project was generated with fastapi-mvc.";
  };
}
