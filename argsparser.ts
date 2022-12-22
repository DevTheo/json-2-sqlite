import {allo} from "./deps.ts";

const Arguments = allo.Arguments;

export const parseArguments = () => {
    const args = new Arguments({
        ...Arguments.createHelpOptions(),
        'table': {
            shortName: 't',
            description: 'Table Name.',
            convertor: Arguments.stringConvertor,
            default: () => "data"
        },
        'filename': {
            shortName: 'fn',
            description: 'Database file Name.',
            convertor: Arguments.stringConvertor
        },
        'json': {
            shortName: 'j',
            description: 'Json file.',
            convertor: Arguments.stringConvertor
        },
        'path': {
            shortName: 'p',
            description: 'Path file.',
            convertor: Arguments.stringConvertor
        }
    }).setDescription("Json 2 Sqlite.")

    // Important for `--help` flag works.
    if (args.isHelpRequested()) args.triggerHelp();

    return args.getFlags();
}