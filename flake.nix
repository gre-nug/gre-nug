{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    devshell = {
      url = "github:numtide/devshell";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    inputs@{ flake-parts, nixpkgs, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [
        inputs.devshell.flakeModule
      ];

      systems = nixpkgs.lib.systems.flakeExposed;

      perSystem =
        {
          config,
          pkgs,
          ...
        }:
        {
          formatter = pkgs.nixfmt-tree;

          devshells.default = {
            packages = with pkgs; [
              slweb
              rsync
            ];

            commands = [
              {
                name = "deploy";
                command = ''
                  generate

                  rsync -rv --delete \
                    public/ \
                    vps:/var/www/grenug/
                '';
              }
              {
                name = "generate";
                command = "slweb src/index.slw > public/index.html";
              }
            ];
          };
        };
    };
}
