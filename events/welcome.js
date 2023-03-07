const Discord = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: 'apps',
    async execute(interaction) {
        if (!interaction.member.roles.cache.get(`${config.roles_configurations.role_join_member}`)) interaction.member.roles.add(`${config.roles_configurations.role_join_member}`)

        interaction.user.send({
            embeds: [
                new Discord.EmbedBuilder()
                    .setColor(config.embed_color.embed_black)
                    .setDescription(`👋 Olá ${interaction.user}, seja muito bem-vindo a **Leinad Hosting**, somos um projeto criado para oferecer serviços de hospedagem confiáveis e de alta qualidade para ajudar você a levar seu negócio ou projeto para o próximo nível.\n\nCaso precise de ajuda para enviar sua aplicação você pode contatar um suporte ou [ler a documentação](https://docs.leinadhosting.app/)`)
            ],
            components: [
                new Discord.ActionRowBuilder()
                    .addComponents(
                        new Discord.ButtonBuilder()
                            .setLabel('Ler documentação')
                            .setEmoji('📝')
                            .setStyle(5)
                            .setURL(`https://docs.leinadhosting.app/`)
                    )
            ]
        })
    }
}