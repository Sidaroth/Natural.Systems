import { ModuleSettings } from 'root/modules/IModule';
import System from 'root/system';

export type Events = {
    'system-ready': System;
    'module-toggled': ModuleSettings | undefined;
    'modules-ready': ModuleSettings[];
};
