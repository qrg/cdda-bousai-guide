'use strict';

import {join, dirname} from 'path';
import {access, constants} from 'fs';
import glob from 'glob';
import {app} from 'electron';

export const USER_DATA = app.getPath('userData');
export const CONFIG_JSON = `${USER_DATA}/config.json`;

export function isReadable(path) {
  return new Promise((done) => {
    access(path, constants.R_OK, (err) => {
      if (err) done(false);
      done(true);
    });
  }).catch(err => {
    throw new Error(err);
  });
}

/*
 * CDDA specific paths
 */
export function isExeForMac(path) {
  return /\/[^\/]+?.app$/.test(path);
}

export function getCDDARootPathByExePath(path) {
  return (
    isExeForMac(path)
      ? join(path, 'Contents', 'Resources')
      : dirname(path)
  );
}

export function getJsonDir(path) {
  return join(path, 'data', 'json');
}

export function getMoDir(path) {
  return join(path, 'lang', 'mo');
}

export function hasJsonDir(path) {
  const dir = getJsonDir(path);
  return isReadable(dir);
}

export function hasMoDir(path) {
  const dir = getMoDir(path);
  return isReadable(dir);
}

export async function validateExePath(exePath) {
  const errMsgs = [];
  const baseDir = getCDDARootPathByExePath(exePath);
  const hasJson = await hasJsonDir(baseDir);
  const hasMo = await hasMoDir(baseDir);

  if (!hasJson) errMsgs.push(`${getJsonDir(baseDir)} is not readable or it does not exist.`);
  if (!hasMo) errMsgs.push(`${getMoDir(baseDir)} is not readable or it does not exist.`);

  return errMsgs;
}

export function readLangDirList(moDir) {
  const pattern = `${moDir}/*/`;
  return new Promise((done, reject) => {
    glob(pattern, {mark: true}, (err, dirs) => {
      if (err) reject(err);
      done(dirs);
    });
  });
}
