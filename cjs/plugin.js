"use strict";
// https://evertpot.com/universal-commonjs-esm-typescript-packages/
// no esModuleInterop, so use 'import * ...'
Object.defineProperty(exports, "__esModule", { value: true });
exports.src = src;
exports.dest = dest;
const through2 = require("through2");
const Vinyl = require("vinyl");
const plugin_error_1 = require("plugin-error");
// const pkginfo = require('pkginfo')(module) // project package.json info into module.exports
// const PLUGIN_NAME = module.exports.name
// import * as loglevel from 'loglevel'
// const log = loglevel.getLogger(PLUGIN_NAME) // get a logger instance based on the project name
// log.setLevel((process.env.DEBUG_LEVEL || 'warn') as loglevel.LogLevelDesc)
const PLUGIN_NAME = 'gulp-dataport-import';
const loglevel_1 = require("loglevel");
const log = loglevel_1.default.getLogger(PLUGIN_NAME); // get a logger instance based on the project name
log.setLevel((process.env.DEBUG_LEVEL || 'warn'));
const path = require("path");
const from2 = require("from2");
const url_1 = require("url");
// import * as fs from 'fs';
const dropbox_1 = require("dropbox");
/* This is a gulp plugin. It is compliant with best practices for Gulp plugins (see
https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/guidelines.md#what-does-a-good-plugin-look-like ) */
function src(url, configObj) {
    let result;
    if (!configObj)
        configObj = {};
    try {
        let fileName = (0, url_1.parse)(url).pathname || "apiResult.dat";
        fileName = path.basename(fileName);
        // from2 returns a writable stream; we put the vinyl file into the stream. This is the core of gulp: Vinyl files
        // inside streams
        // result = from2.obj([vinylFile])
        result = from2.obj(null);
        //
        // Now we set the contents of our vinyl file. For now we're using streams; we'll add buffer support later
        // We want to set our content to the stream produced by the request module:
        //
        // this doesn't work; request doesn't produce a stream when called this way. It doesn't have a .stream() function either...
        // vinylFile.contents = request(url) as any 
        // this works: set contents to a passthrough stream, and pipe the result of the request file through that passthrough stream
        // vinylFile.contents = through2.obj() // passthrough stream 
        // request(url).pipe(vinylFile.contents as unknown as any)
        // this works: same idea as above, but a cleaner
        // make a copy of configObj specific to this file, adding url and leaving original unchanged
        // let optionsCopy = Object.assign({}, configObj, {"url":url})
        if (!configObj.buffer)
            // vinylFile.contents = request(optionsCopy).pipe(through2.obj());      
            throw new plugin_error_1.default(PLUGIN_NAME, "Streaming not available");
        else {
            let dbx = new dropbox_1.Dropbox(configObj);
            // console.log("uploading...")
            // TODO: don't ignore subfolders
            dbx.filesDownload({ path: url })
                // .filesUpload({ path: path.posix.join(directory,file.basename), contents: file.contents as Buffer, mode:mode as any })
                .then((response) => {
                // console.log(response.result);
                let vinylFile = new Vinyl({
                    // base: response.name,   
                    cwd: '/', // just guessing here; not sure if this is the right approach. But it seams to work as intended...
                    path: response.result.path_lower,
                    contents: response.result.fileBinary
                });
                result.push(vinylFile);
                // cb(null, file)
                // console.log("worked!")
            })
                .catch((err) => {
                console.error("promise error: ", JSON.stringify(err));
                // cb(err)
                // throw(err)
                // node.error(err, msg);
                // result.emit(new PluginError(PLUGIN_NAME, err))
            });
        }
    }
    catch (err) {
        // emitting here causes some other error: TypeError: Cannot read property 'pipe' of undefined
        // result.emit(new PluginError(PLUGIN_NAME, err))
        // For now, bubble error up to calling function
        // throw new PluginError(PLUGIN_NAME, err)
    }
    return result;
}
// export function dest(this: any, url:string, options: any) {
function dest(directory, configObj) {
    if (!configObj)
        configObj = {};
    // override configObj defaults here, if needed
    // if (configObj.header === undefined) configObj.header = true
    // creating a stream through which each file will pass - a new instance will be created and invoked for each file 
    // see https://stackoverflow.com/a/52432089/5578474 for a note on the "this" param
    const strm = through2.obj(function (file, encoding, cb) {
        const self = this;
        let returnErr = null;
        if (file.isNull()) {
            // return empty file
            return cb(returnErr, file);
        }
        else if (file.isBuffer()) {
            try {
                // load file location settings, setup dropbox client
                let dbx = new dropbox_1.Dropbox(configObj);
                let mode;
                // if (msg.payload?.result?.rev)
                //     mode = { ".tag": "update", "update": msg.payload?.result?.rev };
                // else
                mode = { ".tag": "overwrite" };
                // console.log("uploading...")
                // TODO: don't ignore subfolders
                dbx.filesUpload({ path: path.posix.join(directory, file.basename), contents: file.contents, mode: mode })
                    .then((response) => {
                    // return msg;
                    cb(null, file);
                    // console.log("worked!")
                })
                    .catch((err) => {
                    console.error(JSON.stringify(err));
                    cb(err);
                    // throw(err)
                    // node.error(err, msg);
                });
            }
            catch (err) {
                // console.log(err);
                cb(err);
            }
        }
        else if (file.isStream()) {
            returnErr = new plugin_error_1.default(PLUGIN_NAME, "Streaming not available");
            // result.emit(returnErr)
            return cb(returnErr, file);
        }
    });
    return strm;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGx1Z2luLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3BsdWdpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsbUVBQW1FO0FBQ25FLDRDQUE0Qzs7QUEyQjVDLGtCQTJFQztBQUdELG9CQTJEQztBQWxLRCxxQ0FBb0M7QUFDcEMsK0JBQThCO0FBQzlCLCtDQUF1QztBQUV2Qyw4RkFBOEY7QUFDOUYsMENBQTBDO0FBQzFDLHVDQUF1QztBQUN2QyxpR0FBaUc7QUFDakcsNkVBQTZFO0FBQzdFLE1BQU0sV0FBVyxHQUFHLHNCQUFzQixDQUFDO0FBQzNDLHVDQUErQjtBQUMvQixNQUFNLEdBQUcsR0FBRyxrQkFBUSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQSxDQUFDLGtEQUFrRDtBQUM5RixHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLElBQUksTUFBTSxDQUEwQixDQUFDLENBQUE7QUFFMUUsNkJBQTRCO0FBQzVCLCtCQUE4QjtBQUM5Qiw2QkFBdUM7QUFDdkMsNEJBQTRCO0FBRTVCLHFDQUFrRDtBQUdsRDtxSEFDcUg7QUFFckgsU0FBZ0IsR0FBRyxDQUFZLEdBQVUsRUFBRSxTQUFjO0lBQ3ZELElBQUksTUFBVyxDQUFDO0lBQ2hCLElBQUksQ0FBQyxTQUFTO1FBQUUsU0FBUyxHQUFHLEVBQUUsQ0FBQTtJQUU5QixJQUFJLENBQUM7UUFDSCxJQUFJLFFBQVEsR0FBWSxJQUFBLFdBQVEsRUFBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLElBQUksZUFBZSxDQUFBO1FBQ2pFLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBRWxDLGdIQUFnSDtRQUNoSCxpQkFBaUI7UUFDakIsa0NBQWtDO1FBQ2xDLE1BQU0sR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQVcsQ0FBQyxDQUFBO1FBRS9CLEVBQUU7UUFDRix5R0FBeUc7UUFDekcsMkVBQTJF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