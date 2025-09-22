// https://evertpot.com/universal-commonjs-esm-typescript-packages/
// no esModuleInterop, so use 'import * ...' (but not in ALL cases, on on 'lead' below)
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
import lead from 'lead';
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
    // Sink the output stream to start flowing
    return lead(strm);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGx1Z2luLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3BsdWdpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxtRUFBbUU7QUFDbkUsdUZBQXVGO0FBRXZGLE9BQU8sS0FBSyxRQUFRLE1BQU0sVUFBVSxDQUFBO0FBQ3BDLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQzlCLE9BQU8sV0FBVyxNQUFNLGNBQWMsQ0FBQztBQUV2Qyw4RkFBOEY7QUFDOUYsMENBQTBDO0FBQzFDLHVDQUF1QztBQUN2QyxpR0FBaUc7QUFDakcsNkVBQTZFO0FBQzdFLE1BQU0sV0FBVyxHQUFHLHNCQUFzQixDQUFDO0FBQzNDLE9BQU8sUUFBUSxNQUFNLFVBQVUsQ0FBQTtBQUMvQixNQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFBLENBQUMsa0RBQWtEO0FBQzlGLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsSUFBSSxNQUFNLENBQTBCLENBQUMsQ0FBQTtBQUUxRSxPQUFPLEtBQUssSUFBSSxNQUFNLE1BQU0sQ0FBQTtBQUM1QixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUM5QixPQUFPLEVBQUUsS0FBSyxJQUFJLFFBQVEsRUFBRSxNQUFNLEtBQUssQ0FBQTtBQUN2Qyw0QkFBNEI7QUFFNUIsT0FBTyxFQUFFLE9BQU8sRUFBa0IsTUFBTSxTQUFTLENBQUM7QUFDbEQsT0FBTyxJQUFJLE1BQU0sTUFBTSxDQUFBO0FBRXZCO3FIQUNxSDtBQUVySCxNQUFNLFVBQVUsR0FBRyxDQUFZLEdBQVUsRUFBRSxTQUFjO0lBQ3ZELElBQUksTUFBVyxDQUFDO0lBQ2hCLElBQUksQ0FBQyxTQUFTO1FBQUUsU0FBUyxHQUFHLEVBQUUsQ0FBQTtJQUU5QixJQUFJLENBQUM7UUFDSCxJQUFJLFFBQVEsR0FBWSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMs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