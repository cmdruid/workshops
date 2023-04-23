# Dockerfile Basics

```dockerfile
FROM debian:bullseye-slim

## Use -y flag to install without prompts.
RUN apt-get update && apt-get install -y neovim

## Make sure to include the trailing slash!
COPY demo/src /src/

## Update your current working directory.
WORKDIR /src

## Set command to run when container starts.
ENTRYPOINT [ "ls" ]

## OPTIONAL: Provide arguments to use with above command.
CMD [ "-al" ]
```