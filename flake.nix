{
  outputs = { nixpkgs, parts, systems, ... } @ inputs: parts.lib.mkFlake { inherit inputs; } {
    systems = import systems;

    perSystem = { lib, pkgs, system, ... }: {
      _module.args = {
        lib = builtins // parts.lib // nixpkgs.lib;
        pkgs = import nixpkgs { inherit system; };
      };

      devShells.default = pkgs.mkShell {
        packages = with pkgs; [ deno nixpkgs-fmt ];
      };

      formatter = pkgs.writeShellScriptBin "formatter" ''
        ${lib.getExe pkgs.deno} fmt .
        ${lib.getExe pkgs.nixpkgs-fmt} .
      '';
    };
  };

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    parts.url = "github:hercules-ci/flake-parts";
    parts.inputs.nixpkgs-lib.follows = "nixpkgs";
    systems.url = "github:nix-systems/triplet";
  };
}
