# Using the CLI
CafeDev comes with a `cafe` executable application to assist with basic tasks.

## Creating new posts
You can create new posts by using `./cafe new post`. You can either specify some/all of the properties:

```bash
./cafe new post --title "My post" --description "Some post information" --author "first.last" --slug "my-post" --tags "some,tags"
```

Or by simply pressing enter and answering the prompts. The command creates a new markdown file and assets folder in the `articles` directory.
