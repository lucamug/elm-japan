# elm-japan-2020

[https://elmjapan.org](https://elmjapan.org)

## Development

```
$ git clone https://github.com/lucamug/elm-japan
$ cd elm-japan
$ cmd/start/start-with-debugger
```

## Build
```
$ cmd/build
```
Create the folder `build` with all the required assets

## Release

Merging modification in the `Master` branch will automatically update the website

[![Netlify Status](https://api.netlify.com/api/v1/badges/45a9e407-44b8-4f7d-99b4-929066ff06ba/deploy-status)](https://app.netlify.com/sites/elmjapan/deploys)

## Utilities
```
$ cmd/start/start-without-debugger
```
To develop using the version without debugger

```
$ cmd/analyse
```
To analyse the code. The report is in `cmd/issues/txt`

```
$ cmd/remove-unused-imports
```
To remove unused imports

```
$ cmd/surge
```
To publish the `build` folder in `Surge`, for testing
