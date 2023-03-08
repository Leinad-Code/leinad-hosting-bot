const Discord = require("discord.js")
const config = require('../../config.json');
const path = require('path');
const process = require('process');
const childProcess = require('child_process');
const { downloadAttachment, extractZip, deleteFile, verifyFiles } = require('../../functions/Scripts');

module.exports = {
    name: "up", // Coloque o nome do comando
    description: "[Usuário] Comando para upar um novo bot.", // Coloque a descrição do comando
    type: Discord.ApplicationCommandType.ChatInput,

    run: async (client, interaction) => {
        const user_db = dbUsers.get(`${interaction.user.id}`);
        const plans_db = dbPlans.get(`${user_db.plan}`);
        const bots_db = dbBots.get(`${interaction.user.id}`)

        const channel_exist = interaction.guild.channels.cache.find(c => c.name === `🆙-${interaction.user.username.toLowerCase().replace(/ /g, '-')}`);

        if (channel_exist) return interaction.reply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setColor(config.embed_color.embed_error)
                    .setDescription(`<a:error:1081135065389600778> ${interaction.user} | Você já possui um canal aberto em ${channel_exist}, tente novamente mais tarde!`)
            ],
            ephemeral: true
        })


        if (bots_db && bots_db.length >= plans_db.max_bot) return interaction.reply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setColor(config.embed_color.embed_error)
                    .setDescription(`<a:error:1081135065389600778> ${interaction.user} | Infelizmente você já atingiu o limite máximo de bot's, caso queira almentar o limite você precisa almentar o seu plano!`)
                    .addFields({ name: 'Limite', value: `\`${bots_db.length}/${plans_db.max_bot}\`` })
            ],
            ephemeral: true
        })

        await interaction.deferReply({ ephemeral: true });

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
                    allow: ["ViewChannel", "SendMessages", "AttachFiles", "AddReactions", "ReadMessageHistory"],
                }
            ]
        })

        interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setColor(config.embed_color.embed_invisible)
                    .setDescription(`<a:verify:1081136161575161886> Foi criado um canal para você realizar o upload de sua aplicação em ${channel}!`)
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
            ],
            ephemeral: true
        })

        const msg = await channel.send({
            content: `${interaction.user}`,
            embeds: [
                new Discord.EmbedBuilder()
                    .setColor(config.embed_color.embed_invisible)
                    .setDescription(`<:atendente:1081136513594703872> Envie abaixo qual será o **apelido** de seu bot!`)
            ]
        })

        var bot = {}

        const filter = i => i.member.id === interaction.user.id;
        const collector_name = channel.createMessageCollector({ filter });

        collector_name.on('collect', (interactionReply) => {
            const regex = /^[a-z\s_-]+$/i;
            if (!regex.test(interactionReply.content)) return interactionReply.delete() + interactionReply.channel.send('<a:error:1081135065389600778> | Tente não utilizar nomes com números de [0-9], somente letras de [a-z]!').then((msg) => { setTimeout(() => { msg.delete() }, 1500); })
            bot.name = interactionReply.content;
            interactionReply.delete();
            collector_name.stop();
        })

        while (!bot.name) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        await msg.edit({
            content: `${interaction.user}`,
            embeds: [
                new Discord.EmbedBuilder()
                    .setColor(config.embed_color.embed_invisible)
                    .setDescription(`<:id:1081380844280750202> Envie abaixo o **ID** de sua applicação!`)
            ]
        })

        const collector_id = channel.createMessageCollector({ filter });
        collector_id.on('collect', (interactionReply) => {
            const regex = /[^0-9]/;
            if (regex.test(interactionReply.content)) return interactionReply.delete() + interactionReply.channel.send('<a:error:1081135065389600778> | Insira um **ID** para aplicação válido!').then((msg) => { setTimeout(() => { msg.delete() }, 1500); })
            // if (!client.api.applications(interactionReply.content)) return interactionReply.delete() + interactionReply.channel.send('<a:error:1081135065389600778> | Isto não é uma aplicação, insira o **ID** válido!').then((msg) => { setTimeout(() => { msg.delete() }, 1500); })
            bot.id = interactionReply.content;
            interactionReply.delete();
            collector_id.stop();
        })

        while (!bot.id) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        await msg.edit({
            content: `${interaction.user}`,
            embeds: [
                new Discord.EmbedBuilder()
                    .setColor(config.embed_color.embed_invisible)
                    .setDescription(`<:js:1081136714027905024> Qual é o nome do arquivo principal do seu bot?\nExemplo: \`index.js, main.js, src/main.js\``)
            ]
        })

        const collector_index = channel.createMessageCollector({ filter });
        collector_index.on('collect', (interactionReply) => {
            if (!interactionReply.content.endsWith('.js')) return interactionReply.delete() + interactionReply.channel.send('<a:error:1081135065389600778> | O arquivo precisa finalizar com \`.js\`').then((msg) => { setTimeout(() => { msg.delete() }, 1500); })
            bot.index = interactionReply.content;
            interactionReply.delete();
            collector_index.stop();
        })

        while (!bot.index) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        let ram_available = plans_db.max_ram;
        let ram_using = 0;

        if (bots_db && bots_db.length > 0) {
            for (let i = 0; i < bots_db.length; i++) {
                ram_using += bots_db[i].ram;
            }

            ram_available -= ram_using;
        }


        await msg.edit({
            content: `${interaction.user}`,
            embeds: [
                new Discord.EmbedBuilder()
                    .setColor(config.embed_color.embed_invisible)
                    .setDescription(`<:ram:1081549712513044520> Qual a quantidade de  \`memoria ram\` você deseja adicionar a esta aplicação? [\`${ram_available}MB disponível\`]`)
            ]
        })

        const collector_ram = channel.createMessageCollector({ filter });
        collector_ram.on('collect', (interactionReply) => {
            const regex = /[^0-9]/;
            if (regex.test(interactionReply.content) || parseInt(interactionReply.content) > ram_available) return interactionReply.delete() + interactionReply.channel.send('<a:error:1081135065389600778> | Insira uma quantidade válida!').then((msg) => { setTimeout(() => { msg.delete() }, 1500); })
            if (parseInt(interactionReply.content) < 50) return interactionReply.delete() + interactionReply.channel.send('<a:error:1081135065389600778> | A quantidade mínima de memória ram é \`50MB\`, para não ter problemas em sua aplicação!').then((msg) => { setTimeout(() => { msg.delete() }, 1500); })
            bot.ram = parseInt(interactionReply.content);
            interactionReply.delete();
            collector_ram.stop();
        })

        while (!bot.ram) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        await msg.edit({
            content: `${interaction.user}`,
            embeds: [
                new Discord.EmbedBuilder()
                    .setColor(config.embed_color.embed_invisible)
                    .setDescription(`Veja abaixo as informações fornecidas sobre sua aplicação:`)
                    .addFields(
                        { name: '<:atendente:1081136513594703872> Nome da aplicaçao', value: `\`${bot.name}\`` },
                        { name: '<:id:1081380844280750202> ID da aplicação', value: `\`${bot.id}\`` },
                        { name: '<:js:1081136714027905024> Arquivo principal', value: `\`${bot.index}\`` },
                        { name: '<:ram:1081549712513044520> Memória RAM', value: `\`${bot.ram}MB\`` }
                    )
                    .setFooter({ text: 'Caso alguma dessa informações esteja incorretas, aguarde e tente novamente!' }),
                new Discord.EmbedBuilder()
                    .setColor(config.embed_color.embed_invisible)
                    .setDescription(`> Envie ou arraste agora o arquivo de seu bot\n> Por preferência utilize a extensão \`.zip\``)
            ]
        })

        const collector_application = channel.createMessageCollector({ filter });
        collector_application.on('collect', async (interactionReply) => {
            const attachment = interactionReply.attachments.first();
            const zipPath = path.join(__dirname, '../../', `upload_temp/${bot.id}.zip`);
            const extractedPath = path.join(`C:\\Applications\\${interaction.user.id}\\${bot.id}`);

            if (attachment && attachment.contentType === 'application/zip') {
                channel.edit({
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: ["ViewChannel"]
                        },
                        {
                            id: interaction.user.id,
                            allow: ["ViewChannel", "AddReactions"],
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
                    await downloadAttachment(attachment.url, zipPath);
                    await extractZip(zipPath, extractedPath);

                    await msg_up.edit({
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setColor(config.embed_color.embed_invisible)
                                .setDescription(`<a:loading:1081068833982382162> | Configurando sua aplicação...`)
                                .setFooter({ text: 'Isto pode demorar um pouco, aguarde!' })
                        ]
                    })

                    await verifyFiles(extractedPath);

                    bot.directory = zipPath;
                    bot.language = 'javascript';
                    dbBots.push(`${interaction.user.id}`, bot)

                    const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

                    // Installing all dependencies!
                    childProcess.spawnSync(npmCommand, ['install'], { cwd: extractedPath });

                    //Starting bot
                    // const args = ['start', bot.index, '--name', bot.id, '--env', `NODE_PATH=${extractedPath}`, '--watch', '--ignore-watch="node_modules"', '--sandbox', '--cwd', extractedPath];
                    const args = ['start', bot.index, '--name', bot.id, extractedPath];
                    childProcess.spawnSync(`pm2.cmd`, args, { cwd: extractedPath })

                    const embed_user = new Discord.EmbedBuilder()
                        .setColor(config.embed_color.embed_error)
                        .setDescription(`💔 ${interaction.user} | Obrigado(a) por utilizar nossos serviços, esta é a sua primeira aplicação de muitas em nossa hospedagem, esperamos que goste de nossos serviços!`)

                    await msg_up.edit({
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setColor(config.embed_color.embed_invisible)
                                .setDescription(`<a:success:1081135243811110962> | Instalando dependências.\n<a:success:1081135243811110962> | Configurando o ambiente.\n<a:success:1081135243811110962> | Compilando aplicação.\n<a:success:1081135243811110962> | Configurando a inicialização...\n\n<a:notify:1081136965828739092> | ${interaction.user.tag} Seu bot foi iniciado!`),
                            new Discord.EmbedBuilder()
                                .setColor(config.embed_color.embed_invisible)
                                .setDescription(`😁 Aoba! Sua aplicação já está pronta para uso beleza? Partiu usar o \`/apps\``)
                                .setFooter({ text: `Feito com muito carinho e ❤️ para você.` })
                        ]
                    }).then((msg => { setTimeout(() => { channel.delete(); deleteFile(zipPath); return bots_db && bots_db.length > 0 ? null : interaction.user.send({ embeds: [embed_user] }); }, 5000 * 5); }))
                } catch (error) {
                    msg_up.edit({
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
        })

        while (!bot.directory) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
}