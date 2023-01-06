Normally sed is invoked like this:

```
sed SCRIPT INPUTFILE...
```

For example, to replace all occurrences of ‘hello’ to ‘world’ in the file input.txt:

```
sed 's/hello/world/' input.txt > output.txt
```

And here is the command we will be running today

```
NODE_ENV=development npm install
```

If you do not specify INPUTFILE, or if INPUTFILE is -, sed filters the contents of the standard input. The following commands are equivalent:

```
sed 's/hello/world/' input.txt > output.txt
sed 's/hello/world/' < input.txt > output.txt
cat input.txt | sed 's/hello/world/' - > output.txt
```

