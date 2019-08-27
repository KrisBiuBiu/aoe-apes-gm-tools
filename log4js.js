module.exports={
    appenders: [
        {
            type: 'console',
            category: 'console'
        },
        // {
        //     type: 'file',
        //     category: 'dateFileLog',
        //     filename: 'logs/aoegmtool.log',
        //     maxLogSize: 104857600,
        //     backups: 100
        // },
        {
            type: 'dateFile',
            category: ['dateFileLog','console'],
            filename: 'logs/aoegmtool',
            pattern: "_yyyy-MM-dd.log",
            // pattern: "_yyyy-MM-dd-hh:mm:ss.log"
            alwaysIncludePattern: true
        },
        {
            type: 'dateFile',
            category: 'agent',
            filename: 'logs/agent',
            pattern: "_yyyy-MM-dd.log",
            // pattern: "_yyyy-MM-dd-hh:mm:ss.log"
            alwaysIncludePattern: true
        }
    ],
    replaceConsole: true,
    levels:{
        dateFileLog: 'ALL',
        console: 'ALL',
        agent: 'ALL'
    }
}