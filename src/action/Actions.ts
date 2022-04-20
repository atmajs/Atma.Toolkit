import { BumpAction } from './bump';
import { ConcatAction } from './concat';
import { ConfigAction } from './config';
import { CopyAction } from './copy';
import { CustomAction } from './custom';
import { HelpAction } from './help';
import { ImportAction } from './import';
import { InitAction } from './init';
import { PluginAction } from './plugin';
import { PublishAction } from './publish';
import { ReferenceAction } from './reference';
import { ReleaseAction } from './release';
import { ServerAction } from './server';
import { ShellAction } from './shell';
import { TemplateAction } from './template';
import { TranspileAction } from './transpile';

export namespace Actions {
    const actions = {
        'bump': BumpAction,
        'concat': ConcatAction,
        'config': ConfigAction,
        'copy': CopyAction,

        'run': CustomAction,
        'custom': CustomAction,

        'help': HelpAction,
        'import': ImportAction,
        'plugin': PluginAction,

        'publish': PublishAction,
        'pub': PublishAction,

        'reference': ReferenceAction,
        'release': ReleaseAction,
        'server': ServerAction,
        'shell': ShellAction,

        'template': TemplateAction,
        'gen': TemplateAction,

        'transpile': TranspileAction,
        'init': InitAction,
    };

    export function get (name: string) {
        return actions[name];
    }
    export function register(name: string, act) {
        actions[name] = act;
    }
}
