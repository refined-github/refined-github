import Window from './window';

global.window = new Window();
global.location = window.location;
global.document = {};
