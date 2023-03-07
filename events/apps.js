const Discord = require('discord.js')
const config = require('../config.json');
const childProcess = require('child_process');
const pm2 = require("@sundawning/pm2-async");
const moment = require('moment');
const path = require('path')
const { downloadAttachment, extractZip, deleteFile, verifyFiles, getFolderSize, moveFolderContents } = require('../functions/Scripts');

module.exports = {
    name: 'apps',
    async execute(interaction) {
        if (interaction.isStringSelectMenu() && interaction.customId === "select_bot") {
            const user_db = dbUsers.get(`${interaction.user.id}`);
            const plans_db = dbPlans.get(`${user_db.plan}`);
            const bots_db = dbBots.get(`${interaction.user.id}`)

            const bot_id = interaction.values[0];

            const this_bot = bots_db.find(app => app.id === `${bot_id}`);

            await pm2.connect();
            const pm2_process = await pm2.list();
            var bot_process = pm2_process.find(process => process.name === `${this_bot.id}`)

            bot_process.online = bot_process.pm2_env.status === "online" ? true : false

            interaction.update({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setAuthor({ name: `${this_bot.name}`, iconURL: `${interaction.guild.iconURL({ dynamic: true })}` })
                        .setColor(config.embed_color.embed_invisible)
                        .setDescription(`📃 Trabalhando para melhorar o mundo!`)
                        .setThumbnail(`${interaction.guild.iconURL({ dynamic: true })}`)
                        .addFields(
                            {
                                name: '<:cpu:1081549687678570526> CPU', value: `\`${bot_process.online ? bot_process.monit.cpu + '%' : 'Indisponível'}\``, inline: true
                            },
                            { name: '<:ram:1081549712513044520> Memória', value: `\`${bot_process.online ? (bot_process.monit.memory / 1000000).toFixed(2) + '/' + plans_db.max_ram + 'MB' : 'Indisponível'}\``, inline: true },
                            { name: '<:status:1081550690545041458> Status', value: `\`${bot_process.online ? '🚀 Em execução' : 'Parado'}\``, inline: true },
                            { name: '📦 Container', value: `\`Online\``, inline: true },
                            {
                                name: '🆙 Uptime', value: `${bot_process.online ? '<t:' + Math.floor(new Date(bot_process.pm2_env.pm_uptime).getTime() / 1000) + ':R>' : '\`Desligado\`'}`, inline: true
                            },
                            { name: '<:storage:1081551072247681064> SSD', value: `\`${((await getFolderSize(bot_process.pm2_env.pm_cwd)) / 1024).toFixed(2)}MB\``, inline: true },
                            { name: '<:id:1081380844280750202> ID', value: `\`${this_bot.id}\``, inline: true },
                            { name: '<a:server:1081561429431287879> SERVIDOR', value: `\`${plans_db.name === "free" ? `FLORIDA-FREE-1` : `NEWYORK-PREMIUM-1`}\``, inline: true },
                            { name: '📅 Criado há', value: `<t:${Math.floor(new Date(bot_process.pm2_env.created_at).getTime() / 1000)}:R>`, inline: true },
                        )
                ],
                components: [
                    new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.ButtonBuilder()
                                .setCustomId(`start_application-${this_bot.id}`)
                                .setEmoji('<:on:1081185530521341992>')
                                .setStyle(3)
                                .setDisabled(bot_process.online ? true : false)
                        )
                        .addComponents(
                            new Discord.ButtonBuilder()
                                .setCustomId(`stop_application-${this_bot.id}`)
                                .setEmoji('<:off:1081185559432679494>')
                                .setStyle(4)
                                .setDisabled(bot_process.online ? false : true)
                        )
                        .addComponents(
                            new Discord.ButtonBuilder()
                                .setCustomId(`restart_application-${this_bot.id}`)
                                .setEmoji('🌀')
                                .setStyle(1)
                                .setDisabled(bot_process.online ? false : true)
                        )
                        .addComponents(
                            new Discord.ButtonBuilder()
                                .setCustomId(`logs_application-${this_bot.id}`)
                                .setEmoji('<:terminal:1081562442217295983>')
                                .setLabel('Logs')
                                .setStyle(1)
                        )
                        .addComponents(
                            new Discord.ButtonBuilder()
                                .setCustomId(`commit_application-${this_bot.id}`)
                                .setEmoji('☁️')
                                .setLabel('Commit')
                                .setStyle(1)
                        ),
                    new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.ButtonBuilder()
                                .setCustomId(`config_application-${this_bot.id}`)
                                .setEmoji('<:config:1081562707242795088>')
                                .setStyle(1)
                        )
                ],
                ephemeral: true
            })
        } else if (interaction.isButton() && interaction.customId.startsWith('start_application-')) {
            const user_db = dbUsers.get(`${interaction.user.id}`);
            const plans_db = dbPlans.get(`${user_db.plan}`);
            const bots_db = dbBots.get(`${interaction.user.id}`)

            const bot_id = interaction.customId.substring(interaction.customId.indexOf('-') + 1);

            const this_bot = bots_db.find(app => app.id === `${bot_id}`);

            childProcess.spawnSync(`pm2.cmd`, ['start', this_bot.id])

            await pm2.connect();
            const pm2_process = await pm2.list();
            var bot_process = pm2_process.find(process => process.name === `${this_bot.id}`)

            bot_process.online = bot_process.pm2_env.status === "online" ? true : false

            interaction.update({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setAuthor({ name: `${this_bot.name}`, iconURL: `${interaction.guild.iconURL({ dynamic: true })}` })
                        .setColor(config.embed_color.embed_invisible)
                        .setDescription(`📃 Trabalhando para melhorar o mundo!`)
                        .setThumbnail(`${interaction.guild.iconURL({ dynamic: true })}`)
                        .addFields(
                            {
                                name: '<:cpu:1081549687678570526> CPU', value: `\`${bot_process.online ? bot_process.monit.cpu + '%' : 'Indisponível'}\``, inline: true
                            },
                            { name: '<:ram:1081549712513044520> Memória', value: `\`${bot_process.online ? (bot_process.monit.memory / 1000000).toFixed(2) + '/' + plans_db.max_ram + 'MB' : 'Indisponível'}\``, inline: true },
                            { name: '<:status:1081550690545041458> Status', value: `\`${bot_process.online ? '🚀 Em execução' : 'Parado'}\``, inline: true },
                            { name: '📦 Container', value: `\`Online\``, inline: true },
                            {
                                name: '🆙 Uptime', value: `${bot_process.online ? '<t:' + Math.floor(new Date(bot_process.pm2_env.pm_uptime).getTime() / 1000) + ':R>' : '\`Desligado\`'}`, inline: true
                            },
                            { name: '<:storage:1081551072247681064> SSD', value: `\`${((await getFolderSize(bot_process.pm2_env.pm_cwd)) / 1024).toFixed(2)}MB\``, inline: true },
                            { name: '<:id:1081380844280750202> ID', value: `\`${this_bot.id}\``, inline: true },
                            { name: '<a:server:1081561429431287879> SERVIDOR', value: `\`${plans_db.name === "free" ? `FLORIDA-FREE-1` : `NEWYORK-PREMIUM-1`}\``, inline: true },
                            { name: '📅 Criado há', value: `<t:${Math.floor(new Date(bot_process.pm2_env.created_at).getTime() / 1000)}:R>`, inline: true },
                        )
                ],
                components: [
                    new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.ButtonBuilder()
                                .setCustomId(`start_application-${this_bot.id}`)
                                .setEmoji('<:on:1081185530521341992>')
                                .setStyle(3)
                                .setDisabled(bot_process.online ? true : false)
                        )
                        .addComponents(
                            new Discord.ButtonBuilder()
                                .setCustomId(`stop_application-${this_bot.id}`)
                                .setEmoji('<:off:1081185559432679494>')
                                .setStyle(4)
                                .setDisabled(bot_process.online ? false : true)
                        )
                        .addComponents(
                            new Discord.ButtonBuilder()
                                .setCustomId(`restart_application-${this_bot.id}`)
                                .setEmoji('🌀')
                                .setStyle(1)
                                .setDisabled(bot_process.online ? false : true)
                        )
                        .addComponents(
                            new Discord.ButtonBuilder()
                                .setCustomId(`logs_application-${this_bot.id}`)
                                .setEmoji('<:terminal:1081562442217295983>')
                                .setLabel('Logs')
                                .setStyle(1)
                        )
                        .addComponents(
                            new Discord.ButtonBuilder()
                                .setCustomId(`commit_application-${this_bot.id}`)
                                .setEmoji('☁️')
                                .setLabel('Commit')
                                .setStyle(1)
                        ),
                    new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.ButtonBuilder()
                                .setCustomId(`config_application-${this_bot.id}`)
                                .setEmoji('<:config:1081562707242795088>')
                                .setStyle(1)
                        )
                ],
                ephemeral: true
            })
        } else if (interaction.isButton() && interaction.customId.startsWith('stop_application-')) {
            const user_db = dbUsers.get(`${interaction.user.id}`);
            const plans_db = dbPlans.get(`${user_db.plan}`);
            const bots_db = dbBots.get(`${interaction.user.id}`)

            const bot_id = interaction.customId.substring(interaction.customId.indexOf('-') + 1);

            const this_bot = bots_db.find(app => app.id === `${bot_id}`);

            childProcess.spawnSync(`pm2.cmd`, ['stop', this_bot.id])

            await pm2.connect();
            const pm2_process = await pm2.list();
            var bot_process = pm2_process.find(process => process.name === `${this_bot.id}`)

            bot_process.online = bot_process.pm2_env.status === "online" ? true : false

            interaction.update({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setAuthor({ name: `${this_bot.name}`, iconURL: `${interaction.guild.iconURL({ dynamic: true })}` })
                        .setColor(config.embed_color.embed_invisible)
                        .setDescription(`📃 Trabalhando para melhorar o mundo!`)
                        .setThumbnail(`${interaction.guild.iconURL({ dynamic: true })}`)
                        .addFields(
                            {
                                name: '<:cpu:1081549687678570526> CPU', value: `\`${bot_process.online ? bot_process.monit.cpu + '%' : 'Indisponível'}\``, inline: true
                            },
                            { name: '<:ram:1081549712513044520> Memória', value: `\`${bot_process.online ? (bot_process.monit.memory / 1000000).toFixed(2) + '/' + plans_db.max_ram + 'MB' : 'Indisponível'}\``, inline: true },
                            { name: '<:status:1081550690545041458> Status', value: `\`${bot_process.online ? '🚀 Em execução' : 'Parado'}\``, inline: true },
                            { name: '📦 Container', value: `\`Online\``, inline: true },
                            {
                                name: '🆙 Uptime', value: `${bot_process.online ? '<t:' + Math.floor(new Date(bot_process.pm2_env.pm_uptime).getTime() / 1000) + ':R>' : '\`Desligado\`'}`, inline: true
                            },
                            { name: '<:storage:1081551072247681064> SSD', value: `\`${((await getFolderSize(bot_process.pm2_env.pm_cwd)) / 1024).toFixed(2)}MB\``, inline: true },
                            { name: '<:id:1081380844280750202> ID', value: `\`${this_bot.id}\``, inline: true },
                            { name: '<a:server:1081561429431287879> SERVIDOR', value: `\`${plans_db.name === "free" ? `FLORIDA-FREE-1` : `NEWYORK-PREMIUM-1`}\``, inline: true },
                            { name: '📅 Criado há', value: `<t:${Math.floor(new Date(bot_process.pm2_env.created_at).getTime() / 1000)}:R>`, inline: true },
                        )
                ],
                components: [
                    new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.ButtonBuilder()
                                .setCustomId(`start_application-${this_bot.id}`)
                                .setEmoji('<:on:1081185530521341992>')
                                .setStyle(3)
                                .setDisabled(bot_process.online ? true : false)
                        )
                        .addComponents(
                            new Discord.ButtonBuilder()
                                .setCustomId(`stop_application-${this_bot.id}`)
                                .setEmoji('<:off:1081185559432679494>')
                                .setStyle(4)
                                .setDisabled(bot_process.online ? false : true)
                        )
                        .addComponents(
                            new Discord.ButtonBuilder()
                                .setCustomId(`restart_application-${this_bot.id}`)
                                .setEmoji('🌀')
                                .setStyle(1)
                                .setDisabled(bot_process.online ? false : true)
                        )
                        .addComponents(
                            new Discord.ButtonBuilder()
                                .setCustomId(`logs_application-${this_bot.id}`)
                                .setEmoji('<:terminal:1081562442217295983>')
                                .setLabel('Logs')
                                .setStyle(1)
                        )
                        .addComponents(
                            new Discord.ButtonBuilder()
                                .setCustomId(`commit_application-${this_bot.id}`)
                                .setEmoji('☁️')
                                .setLabel('Commit')
                                .setStyle(1)
                        ),
                    new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.ButtonBuilder()
                                .setCustomId(`config_application-${this_bot.id}`)
                                .setEmoji('<:config:1081562707242795088>')
                                .setStyle(1)
                        )
                ],
                ephemeral: true
            })
        } else if (interaction.isButton() && interaction.customId.startsWith("restart_application-")) {
            const user_db = dbUsers.get(`${interaction.user.id}`);
            const plans_db = dbPlans.get(`${user_db.plan}`);
            const bots_db = dbBots.get(`${interaction.user.id}`)

            const bot_id = interaction.customId.substring(interaction.customId.indexOf('-') + 1);

            const this_bot = bots_db.find(app => app.id === `${bot_id}`);

            childProcess.spawnSync(`pm2.cmd`, ['restart', this_bot.id])

            await pm2.connect();
            const pm2_process = await pm2.list();
            var bot_process = pm2_process.find(process => process.name === `${this_bot.id}`)

            bot_process.online = bot_process.pm2_env.status === "online" ? true : false

            interaction.update({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setAuthor({ name: `${this_bot.name}`, iconURL: `${interaction.guild.iconURL({ dynamic: true })}` })
                        .setColor(config.embed_color.embed_invisible)
                        .setDescription(`📃 Trabalhando para melhorar o mundo!`)
                        .setThumbnail(`${interaction.guild.iconURL({ dynamic: true })}`)
                        .addFields(
                            {
                                name: '<:cpu:1081549687678570526> CPU', value: `\`${bot_process.online ? bot_process.monit.cpu + '%' : 'Indisponível'}\``, inline: true
                            },
                            { name: '<:ram:1081549712513044520> Memória', value: `\`${bot_process.online ? (bot_process.monit.memory / 1000000).toFixed(2) + '/' + plans_db.max_ram + 'MB' : 'Indisponível'}\``, inline: true },
                            { name: '<:status:1081550690545041458> Status', value: `\`${bot_process.online ? '🚀 Em execução' : 'Parado'}\``, inline: true },
                            { name: '📦 Container', value: `\`Online\``, inline: true },
                            {
                                name: '🆙 Uptime', value: `${bot_process.online ? '<t:' + Math.floor(new Date(bot_process.pm2_env.pm_uptime).getTime() / 1000) + ':R>' : '\`Desligado\`'}`, inline: true
                            },
                            { name: '<:storage:1081551072247681064> SSD', value: `\`${((await getFolderSize(bot_process.pm2_env.pm_cwd)) / 1024).toFixed(2)}MB\``, inline: true },
                            { name: '<:id:1081380844280750202> ID', value: `\`${this_bot.id}\``, inline: true },
                            { name: '<a:server:1081561429431287879> SERVIDOR', value: `\`${plans_db.name === "free" ? `FLORIDA-FREE-1` : `NEWYORK-PREMIUM-1`}\``, inline: true },
                            { name: '📅 Criado há', value: `<t:${Math.floor(new Date(bot_process.pm2_env.created_at).getTime() / 1000)}:R>`, inline: true },
                        )
                ],
                components: [
                    new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.ButtonBuilder()
                                .setCustomId(`start_application-${this_bot.id}`)
                                .setEmoji('<:on:1081185530521341992>')
                                .setStyle(3)
                                .setDisabled(bot_process.online ? true : false)
                        )
                        .addComponents(
                            new Discord.ButtonBuilder()
                                .setCustomId(`stop_application-${this_bot.id}`)
                                .setEmoji('<:off:1081185559432679494>')
                                .setStyle(4)
                                .setDisabled(bot_process.online ? false : true)
                        )
                        .addComponents(
                            new Discord.ButtonBuilder()
                                .setCustomId(`restart_application-${this_bot.id}`)
                                .setEmoji('🌀')
                                .setStyle(1)
                                .setDisabled(bot_process.online ? false : true)
                        )
                        .addComponents(
                            new Discord.ButtonBuilder()
                                .setCustomId(`logs_application-${this_bot.id}`)
                                .setEmoji('<:terminal:1081562442217295983>')
                                .setLabel('Logs')
                                .setStyle(1)
                        )
                        .addComponents(
                            new Discord.ButtonBuilder()
                                .setCustomId(`commit_application-${this_bot.id}`)
                                .setEmoji('☁️')
                                .setLabel('Commit')
                                .setStyle(1)
                        ),
                    new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.ButtonBuilder()
                                .setCustomId(`config_application-${this_bot.id}`)
                                .setEmoji('<:config:1081562707242795088>')
                                .setStyle(1)
                        )
                ],
                ephemeral: true
            })
        } else if (interaction.isButton() && interaction.customId.startsWith("logs_application-")) {
            await interaction.deferReply({ ephemeral: true });

            const user_db = dbUsers.get(`${interaction.user.id}`);
            const plans_db = dbPlans.get(`${user_db.plan}`);
            const bots_db = dbBots.get(`${interaction.user.id}`)

            const bot_id = interaction.customId.substring(interaction.customId.indexOf('-') + 1);

            const this_bot = bots_db.find(app => app.id === `${bot_id}`);

            await pm2.connect();
            const pm2_process = await pm2.list();
            const bot_process = pm2_process.find(process => process.name === `${this_bot.id}`)

            let index = 0;

            const child_procc = childProcess.spawn('pm2.cmd', ['logs', this_bot.id, '--nostream', '--raw', '--format', '--merge-logs', '--json', '--time', '--out']);

            child_procc.on('exit', (code, sinal) => {
                if (code === 0) code = child_procc.stdout.read();
                const logs = code.toString();
                interaction.editReply({
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setColor(config.embed_color.embed_invisible)
                            .setDescription(`\`\`\`${logs.split('\n').slice(2).join('\n')}\`\`\``)
                    ], ephemeral: true
                })
            })
        } else if (interaction.isButton() && interaction.customId.startsWith("commit_application-")) {
            await interaction.deferReply({ ephemeral: true });

            const user_db = dbUsers.get(`${interaction.user.id}`);
            const plans_db = dbPlans.get(`${user_db.plan}`);
            const bots_db = dbBots.get(`${interaction.user.id}`)

            const bot_id = interaction.customId.substring(interaction.customId.indexOf('-') + 1);

            const this_bot = bots_db.find(app => app.id === `${bot_id}`);

            const channel = await interaction.guild.channels.create({
                name: `🆙-${interaction.user.username}`,
                type: 0,
                parent: config.configurations.category_up,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: ["ViewChannel"]
                    },
                    {
                        id: interaction.user.id,
                        allow: ["ViewChannel", "ReadMessageHistory"],
                    }
                ]
            })

            const msg = await channel.send({
                content: `${interaction.user}`,
                embeds: [
                    new Discord.EmbedBuilder()
                        .setColor(config.embed_color.embed_invisible)
                        .setDescription(`Antes de prosseguir com a atualização em sua aplicação, é importante que você faça um backup de seus dados. Isso garantirá que, caso ocorra algum imprevisto durante o processo de atualização, você terá seus dados seguros e protegidos.\n\n> <a:notify:1081136965828739092> Com isso em mente, você gostaria de continuar com a atualização?`)
                ],
                components: [
                    new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.ButtonBuilder()
                                .setCustomId('yes')
                                .setEmoji('<a:right:1081135925125447710>')
                                .setLabel('Sim')
                                .setStyle(3)
                        )
                        .addComponents(
                            new Discord.ButtonBuilder()
                                .setCustomId('no')
                                .setEmoji('<a:right:1081135925125447710>')
                                .setLabel('Não')
                                .setStyle(4)
                        )
                ]
            })

            interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setColor(config.embed_color.embed_black)
                        .setDescription(`<a:verify:1081136161575161886> Foi aberto um canal para você realizar o upload de sua aplicação em ${channel}`)
                ],
                components: [
                    new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.ButtonBuilder()
                                .setEmoji('<a:right:1081135925125447710>')
                                .setLabel('Ir para canal')
                                .setStyle(5)
                                .setURL(`${channel.url}`)
                        )
                ]
            })

            const filter = i => i.member.id === interaction.user.id;
            const collector = msg.createMessageComponentCollector({ filter });

            let is_reply = false;

            collector.on('collect', (interactionReply) => {
                if (interactionReply.customId === "no") return collector.stop() + interactionReply.channel.delete();
                is_reply = true;
                collector.stop();
            })

            while (!is_reply) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            channel.edit({
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: ["ViewChannel"]
                    },
                    {
                        id: interaction.user.id,
                        allow: ["ViewChannel", "ReadMessageHistory", "SendMessages", "AttachFiles"],
                    }
                ]
            })

            await msg.edit({
                content: ``,
                embeds: [
                    new Discord.EmbedBuilder()
                        .setColor(config.embed_color.embed_invisible)
                        .setDescription(`> Envie ou arraste agora o arquivo de seu bot\n> Por preferência utilize a extensão \`.zip\``)
                ],
                components: []
            })

            const collector_application = channel.createMessageCollector({ filter });
            collector_application.on('collect', async (interactionReply) => {
                const attachment = interactionReply.attachments.first();
                const zipPath = path.join(__dirname, '../', `upload_temp/commit_${this_bot.id}.zip`);
                const extractedPathTemporary = path.join(`C:\\Applications\\${interaction.user.id}\\${this_bot.id}\\temp_commit`);
                const extractedPath = path.join(`C:\\Applications\\${interaction.user.id}\\${this_bot.id}`);

                if (attachment && attachment.contentType === 'application/zip') {
                    channel.edit({
                        permissionOverwrites: [
                            {
                                id: interaction.guild.id,
                                deny: ["ViewChannel"]
                            },
                            {
                                id: interaction.user.id,
                                allow: ["ViewChannel", "ReadMessageHistory"],
                                deny: ["SendMessages", "AttachFiles"]
                            }
                        ]
                    })

                    await interactionReply.delete();

                    const msg_up = await interactionReply.channel.send({
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setColor(config.embed_color.embed_invisible)
                                .setDescription(`<a:loading:1081068833982382162> | Configurando sua aplicação...`)
                        ]
                    })

                    try {
                        childProcess.spawnSync(`pm2.cmd`, ['stop', this_bot.id])

                        await downloadAttachment(attachment.url, zipPath);
                        await extractZip(zipPath, extractedPathTemporary);

                        await msg_up.edit({
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setColor(config.embed_color.embed_invisible)
                                    .setDescription(`<a:loading:1081068833982382162> | Configurando sua aplicação...`)
                                    .setFooter({ text: 'Isto pode demorar um pouco, aguarde!' })
                            ]
                        })

                        await verifyFiles(extractedPathTemporary);

                        await moveFolderContents(extractedPathTemporary, extractedPath);

                        childProcess.spawnSync(`pm2.cmd`, ['start', this_bot.id])

                        await msg_up.edit({
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setColor(config.embed_color.embed_invisible)
                                    .setDescription(`<a:success:1081135243811110962> | Implementando aplicação!`),
                                new Discord.EmbedBuilder()
                                    .setColor(config.embed_color.embed_invisible)
                                    .setDescription(`😁 Aoba! Sua aplicação foi atualizado beleza?`)
                                    .setFooter({ text: `Feito com muito carinho e ❤️ para você.` })
                            ]
                        }).then((msg => { setTimeout(() => { channel.delete(); deleteFile(zipPath); return; }, 5000 * 5); }))
                    } catch (error) {
                        await msg_up.delete();
                        msg.edit({
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setColor(config.embed_color.embed_error)
                                    .setDescription(`❌ ${interaction.user} | Houve um erro ao tentar iniciar a aplicação, tente novamente!\n\n**Erro:** \`${error.message}\``)
                            ]
                        }).then((msg => { setTimeout(() => { channel.delete(); deleteFile(zipPath); deleteFile(extractedPath); return; }, 5000); }))
                    }
                } else {
                    return interactionReply.delete() + interactionReply.channel.send('<a:error:1081135065389600778> | O arquivo enviado é inválido, envie um arquivo valido, de preferência um arquivo \`.zip\`!').then((msg) => { setTimeout(() => { msg.delete() }, 1500); })
                }
            });
        } else if (interaction.isButton() && interaction.customId.startsWith('config_application')) {

            const user_db = dbUsers.get(`${interaction.user.id}`);
            const plans_db = dbPlans.get(`${user_db.plan}`);
            const bots_db = dbBots.get(`${interaction.user.id}`)

            const bot_id = interaction.customId.substring(interaction.customId.indexOf('-') + 1);

            const this_bot = bots_db.find(app => app.id === `${bot_id}`);

            const msg = await interaction.reply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setColor(config.client.embed)
                        .setTitle('Escolha alguma opção para presseguir a configuração!')
                        .setFooter({ text: 'Esta interação é válida por 15 segundos.' })
                ],
                components: [
                    new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.ButtonBuilder()
                                .setCustomId(`change_ram`)
                                .setLabel('Editar memória RAM')
                                .setEmoji('<:ram:1081549712513044520>')
                                .setStyle(3)
                        )
                        .addComponents(
                            new Discord.ButtonBuilder()
                                .setCustomId(`delete_application`)
                                .setLabel('Deletar aplicação')
                                .setStyle(4)
                        )
                ],
                ephemeral: true
            })

            const filter = i => i.member.id === interaction.user.id;
            const collector = msg.createMessageComponentCollector({ filter, time: 15000 });
            collector.on('collect', async (interactionReply) => {
                if (interaction.isButton() && interactionReply.customId === "change_ram") {

                } else if (interaction.isButton() && interactionReply.customId === "delete_application") {
                    const modal = new Discord.ModalBuilder()
                        .setCustomId('delete_application')
                        .setTitle(`Deletar aplicação`)

                    const application_name = new Discord.TextInputBuilder()
                        .setCustomId('application_name')
                        .setLabel('Digite o nome da aplicação para continuar')
                        .setRequired(true)
                        .setMaxLength(this_bot.name.length + 5)
                        .setStyle(1)
                        .setPlaceholder(`${this_bot.name}`);

                    modal.addComponents(
                        new Discord.ActionRowBuilder().addComponents(application_name)
                    );

                    await interactionReply.showModal(modal);
                    const submitted = await interactionReply.awaitModalSubmit({ time: 60000, filter: i => i.user.id === interaction.user.id });

                    if (!submitted) return;
                    const application_name_field = submitted.fields.getTextInputValue("application_name")
                    if (application_name_field !== `${this_bot.name}`) {
                        await submitted.deferUpdate({ ephemeral: true });
                        await submitted.editReply({
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setColor(config.embed_color.embed_error)
                                    .setDescription('<a:error:1081135065389600778> | O nome inserido não corresponde ao mesmo da aplicação, tente novamente!')
                            ],
                            components: []
                        })

                        return;
                    }

                    dbBots.set(`${interaction.user.id}`, bots_db.filter(app => app.id === `${this_bot.id}`))

                    await submitted.deferUpdate({ ephemeral: true });
                    await submitted.editReply({
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setColor(config.client.embed)
                                .setDescription(`<a:success:1081135243811110962> Aplicação deletada com sucesso!`)
                        ],
                        components: []
                    })

                    // const message = await interaction.channel.messages.cache.get(interaction.message.id);

                    // interaction.update({
                    //     embeds: [
                    //         new Discord.EmbedBuilder()
                    //             .setColor(config.embed_color.embed_error)
                    //             .setDescription(`<a:error:1081135065389600778> Aplicação não encontrada!`)
                    //     ],
                    //     components: []
                    // })
                }
            })
        }
    }
}