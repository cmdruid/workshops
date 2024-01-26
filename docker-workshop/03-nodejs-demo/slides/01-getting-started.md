# Nodejs Demo

Build the image:
```bash
docker build -t nodejs-img .
```

Launch the container:
```bash
docker run -p 8081:3000 -v ./src:/root/src nodejs-img
```

