const Discord = require("discord.js")
const config = require('../../config.json');
const path = require('path');
const process = require('process');
const childProcess = require('child_process');
const { downloadAttachment, extractZip, deleteFile, verifyFiles } = require('../../functions/Scripts');

module.exports = {
    name: "configurações", // Coloque o nome do comando
    description: "[Usuário] Comando para upar um novo bot.", // Coloque a descrição do comando
    type: Discord.ApplicationCommandType.ChatInput,

    run: async (client, interaction) => {
        const user_db = dbUsers.get(`${interaction.user.id}`);
        const plans_db = dbPlans.get(`${user_db.plan}`);
        const bots_db = dbBots.get(`${interaction.user.id}`);

        let language_text = {}

        switch (user_db.language) {
            case "portugues":
                language_text = { text: 'Português', flag: '🇧🇷' }
                break;
            case "english":
                language_text = { text: 'English', flag: '🇺🇸' }
                break;
            case "espanol":
                language_text = { text: 'Espanõl', flag: '🇪🇸' }
                break;
        }

        return interaction.reply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setColor(config.embed_color.embed_invisible)
                    .setAuthor({ name: `${interaction.user.tag} (${interaction.user.id})`, iconURL: `${interaction.user.displayAvatarURL({ dynamic: true })}` })
                    .setThumbnail(`${interaction.user.displayAvatarURL({ dynamic: true })}`)
                    .setDescription(`Escolha uma opção abaixo para alterar seu perfil!`)
                    .addFields(
                        { name: 'Linguagem', value: `\`${language_text.text}\`` },
                        { name: 'Privacidade', value: `\`${user_db.private_profile ? 'Privado' : 'Público'}\`` },
                        { name: 'Descrição', value: `\`${user_db.description ? user_db.description : '📰 Sem nada a diser!'}\`` }
                    )
            ],
            components: [
                new Discord.ActionRowBuilder()
                    .addComponents(
                        new Discord.ButtonBuilder()
                            .setCustomId('change_language')
                            .setLabel('Alterar linguagem')
                            .setStyle(2)
                            .setEmoji('🇧🇷')
                    )
                    .addComponents(
                        new Discord.ButtonBuilder()
                            .setCustomId('change_privacity')
                            .setLabel('Alterar privacidade')
                            .setStyle(2)
                            .setEmoji('🔒')
                    )
                    .addComponents(
                        new Discord.ButtonBuilder()
                            .setCustomId('change_description')
                            .setLabel('Alterar descrição')
                            .setStyle(1)
                            .setEmoji('✏️')
                    )
            ],
            ephemeral: true
        })
    }
}