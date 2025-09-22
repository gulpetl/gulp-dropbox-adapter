// https://evertpot.com/universal-commonjs-esm-typescript-packages/
// no esModuleInterop, so use 'import * ...'
import * as through2 from 'through2';
import * as Vinyl from 'vinyl';
import PluginError from 'plugin-error';
// const pkginfo = require('pkginfo')(module) // project package.json info into module.exports
// const PLUGIN_NAME = module.exports.name
// import * as loglevel from 'loglevel'
// const log = loglevel.getLogger(PLUGIN_NAME) // get a logger instance based on the project name
// log.setLevel((process.env.DEBUG_LEVEL || 'warn') as loglevel.LogLevelDesc)
const PLUGIN_NAME = 'gulp-dataport-import';
import loglevel from 'loglevel';
const log = loglevel.getLogger(PLUGIN_NAME); // get a logger instance based on the project name
log.setLevel((process.env.DEBUG_LEVEL || 'warn'));
import * as path from 'path';
import * as from2 from 'from2';
import { parse as urlParse } from 'url';
// import * as fs from 'fs';
import { Dropbox } from 'dropbox';
/* This is a gulp plugin. It is compliant with best practices for Gulp plugins (see
https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/guidelines.md#what-does-a-good-plugin-look-like ) */
export function src(url, configObj) {
    let result;
    if (!configObj)
        configObj = {};
    try {
        let fileName = urlParse(url).pathname || "apiResult.dat";
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
            throw new PluginError(PLUGIN_NAME, "Streaming not available");
        else {
            let dbx = new Dropbox(configObj);
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
export function dest(directory, configObj) {
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
                let dbx = new Dropbox(configObj);
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
            returnErr = new PluginError(PLUGIN_NAME, "Streaming not available");
            // result.emit(returnErr)
            return cb(returnErr, file);
        }
    });
    return strm;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGx1Z2luLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3BsdWdpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxtRUFBbUU7QUFDbkUsNENBQTRDO0FBRTVDLE9BQU8sS0FBSyxRQUFRLE1BQU0sVUFBVSxDQUFBO0FBQ3BDLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQzlCLE9BQU8sV0FBVyxNQUFNLGNBQWMsQ0FBQztBQUV2Qyw4RkFBOEY7QUFDOUYsMENBQTBDO0FBQzFDLHVDQUF1QztBQUN2QyxpR0FBaUc7QUFDakcsNkVBQTZFO0FBQzdFLE1BQU0sV0FBVyxHQUFHLHNCQUFzQixDQUFDO0FBQzNDLE9BQU8sUUFBUSxNQUFNLFVBQVUsQ0FBQTtBQUMvQixNQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFBLENBQUMsa0RBQWtEO0FBQzlGLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsSUFBSSxNQUFNLENBQTBCLENBQUMsQ0FBQTtBQUUxRSxPQUFPLEtBQUssSUFBSSxNQUFNLE1BQU0sQ0FBQTtBQUM1QixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUM5QixPQUFPLEVBQUUsS0FBSyxJQUFJLFFBQVEsRUFBRSxNQUFNLEtBQUssQ0FBQTtBQUN2Qyw0QkFBNEI7QUFFNUIsT0FBTyxFQUFFLE9BQU8sRUFBa0IsTUFBTSxTQUFTLENBQUM7QUFHbEQ7cUhBQ3FIO0FBRXJILE1BQU0sVUFBVSxHQUFHLENBQVksR0FBVSxFQUFFLFNBQWM7SUFDdkQsSUFBSSxNQUFXLENBQUM7SUFDaEIsSUFBSSxDQUFDLFNBQVM7UUFBRSxTQUFTLEdBQUcsRUFBRSxDQUFBO0lBRTlCLElBQUksQ0FBQztRQUNILElBQUksUUFBUSxHQUFZLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLElBQUksZUFBZSxDQUFBO1FBQ2pFLFFBQVEs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