{
    inputs.nixpkgs.url = github:nixos/nixpkgs/nixos-unstable;

    outputs = { self, nixpkgs }:
    let
        system = "x86_64-linux";
        pkgs = import nixpkgs { inherit system; };

    in {
        apps.${system} = let
            generate = "${pkgs.slweb}/bin/slweb src/index.slw > public/index.html";

        in {
            default = {
                type = "app";
                program = toString (pkgs.writeScript "generate" generate);
            };

            deploy = {
                type = "app";
                program = toString (pkgs.writeScript "deploy" ''
                    set -e
                    ${generate}

                    ${pkgs.rsync}/bin/rsync -rv --delete \
                        public/ \
                        server:/var/www/grenug/
                '');
            };
        };
    };
}
