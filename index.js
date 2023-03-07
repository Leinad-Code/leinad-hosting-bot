const Discord = require("discord.js");
const { joinVoiceChannel } = require('@discordjs/voice')
const config = require("./config.json");
const fs = require('fs');
const { JsonDatabase } = require("wio.db");

// Database
global.dbPlans = new JsonDatabase({
    databasePath: "./databases/plans.json"
});
global.dbUsers = new JsonDatabase({
    databasePath: "./databases/users.json"
});
global.dbBots = new JsonDatabase({
    databasePath: "./databases/bots.json"
});
//--

const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent,
        Discord.GatewayIntentBits.GuildMembers,
        Discord.GatewayIntentBits.GuildMessageReactions,
        '32767'
    ]
});

module.exports = client

let lagging_users = []

client.on('interactionCreate', async (interaction) => {
    if (interaction.type === Discord.InteractionType.ApplicationCommand) {

        const cmd = client.slashCommands.get(interaction.commandName);

        if (!cmd) return interaction.reply({ content: `Erro, este comando não existe`, ephemeral: true });

        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) return cmd.run(client, interaction);

        interaction["member"] = interaction.guild.members.cache.get(interaction.user.id);

        const timeout = 3000;
        const index = lagging_users.findIndex(user => user.id === interaction.user.id);
        if (index !== -1) {
            const remainingTime = lagging_users[index].timeout - Date.now();
            if (remainingTime > 0) {
                await interaction.deferReply({ ephemeral: true });
                await interaction.editReply(`❌ | Aguarde \`${Math.ceil(remainingTime / 1000)}\` segundos para utilizar o comando novamente!`);
                return;
            }
        }

        lagging_users = lagging_users.filter((user) => user.id !== interaction.user.id);
        lagging_users.push({ id: interaction.user.id, timeout: Date.now() + timeout });

        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) return interaction.reply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setColor(config.embed_color.embed_invisible)
                    .setDescription(``)
            ]
        })

        cmd.run(client, interaction);
    }
});

client.on("ready", () => {
    console.log(`👋 Hello world`)
    console.log(`🤖 My name is ${client.user.username}`)
    console.log(`💔 I have ${client.users.cache.size} friends`)
    console.log(`👨 More than ${client.guilds.cache.size} groups support me.`)
});

/*============================= | MEMBER ADD | =========================================*/
client.on('guildMemberAdd', (interaction) => {
    if (dbUsers.get(`${interaction.user.id}`)) return;

    dbUsers.set(`${interaction.user.id}`, {
        plan: `free`
    })
})

/*============================= | Anti OFF | =========================================*/

// process.on('multipleResolves', (type, reason, promise) => {
//     return;
// });
// process.on('unhandRejection', (reason, promise) => {
//     return;
// });
// process.on('uncaughtException', (error, origin) => {
//     return;
// });
// process.on('uncaughtException', (error, origin) => {
//     return;
// });

/*============================= | STATUS RICH PRESENCE | =========================================*/

client.on("ready", () => {
    client.user.setStatus("online");
});

/*============================= | Import handler | =========================================*/

client.slashCommands = new Discord.Collection()

require('./handler')(client)

client.login(config.client.token)

/*============================= | EXECUTE | =========================================*/

client.on('interactionCreate', require('./events/apps').execute)

//Member join
client.on('guildMemberAdd', require('./events/welcome').execute)