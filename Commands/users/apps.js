const Discord = require("discord.js")
const config = require('../../config.json');

module.exports = {
    name: "apps", // Coloque o nome do comando
    description: "[Usuário] Comando para gerenciar uma aplicação!", // Coloque a descrição do comando
    type: Discord.ApplicationCommandType.ChatInput,

    run: async (client, interaction) => {
        const user_db = dbUsers.get(`${interaction.user.id}`);
        const plans_db = dbPlans.get(`${user_db.plan}`);
        const bots_db = dbBots.get(`${interaction.user.id}`)

        if (!bots_db || bots_db.length < 1) return interaction.reply({
            embeds: [new Discord.EmbedBuilder()
                .setColor(config.embed_color.embed_error)
                .setDescription(`<a:error:1081135065389600778> ${interaction.user} | Você não possui nenhuma aplicação hospedada em nossos serviços, realize o upload agora mesmo é 100% gratuito, utilize o comando \`/up\``)
            ],
            ephemeral: true
        })

        const options = [];

        bots_db.forEach(app => {
            options.push({ emoji: '<:js:1081136714027905024>', label: `${app.name} (${app.id})`, description: 'Aplicação javascript', value: `${app.id}` })
        });

        const random = Math.random()

        await interaction.reply({
            embeds: [new Discord.EmbedBuilder()
                .setColor(config.embed_color.embed_invisible)
                .setAuthor({ name: `${interaction.user.tag} (${interaction.user.id})`, iconURL: `${interaction.user.displayAvatarURL({ dynamic: true })}` })
            ],
            components: [
                new Discord.ActionRowBuilder()
                    .addComponents(
                        new Discord.StringSelectMenuBuilder()
                            .setCustomId('select_bot')
                            .setPlaceholder('➡️ Selecione uma aplicação')
                            .addOptions(options)
                    )
            ],
            ephemeral: true
        })

        if (random > 0.2 && user_db.plan === "free") return interaction.followUp({
            embeds: [
                new Discord.EmbedBuilder()
                    .setThumbnail(`${interaction.guild.iconURL({ dynamic: true })}`)
                    .setColor(config.embed_color.embed_invisible)
                    .setDescription(`🤝 Seja um doador da Leinad Hosting e contribua para um projeto social incrível!\n\n> ❤️ Com a sua ajuda, podemos fornecer hospedagem gratuita para milhares de pessoas, escolas e universidades. Como agradecimento, você terá acesso a benefícios exclusivos em nosso plano pago. Junte-se a nós agora e ajude a fazer a diferença! 🌟`)
                    .setFooter({ text: `Faça a diferença ❤️ © ${interaction.guild.name}` })
            ],
            components: [
                new Discord.ActionRowBuilder()
                    .addComponents(
                        new Discord.ButtonBuilder()
                            .setStyle(5)
                            .setLabel('Fazer contribuição')
                            .setURL(`https://leinadhosting.app`)
                    )
            ],
            ephemeral: true
        })
    }
}