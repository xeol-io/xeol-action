# Developing tests

Some tests require a docker registry running locally on port 5000 as well as
some images built.

```
docker run -d -p 5000:5000 --name registry registry:2

for name in mongo-32; do
  docker build -t localhost:5000/match-coverage/$name ./tests/fixtures/image-$name-match-coverage
  docker push localhost:5000/match-coverage/$name:latest
done
```

Then, just run:

```
npm test
```
