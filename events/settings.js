const Discord = require('discord.js')
const config = require('../config.json');
const childProcess = require('child_process');
const pm2 = require("@sundawning/pm2-async");
const moment = require('moment');
const path = require('path')
const { downloadAttachment, extractZip, deleteFile, deleteFolder, verifyFiles, getFolderSize, moveFolderContents } = require('../functions/Scripts');

module.exports = {
    name: 'settings',
    async execute(interaction) {
        if (interaction.isButton() && interaction.customId === "change_language") {
            var user_db = dbUsers.get(`${interaction.user.id}`);
            var plans_db = dbPlans.get(`${user_db.plan}`);
            var bots_db = dbBots.get(`${interaction.user.id}`);

            await interaction.deferUpdate({ ephemeral: true });
            const msg = await interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setColor(config.embed_color.embed_invisible)
                        .setDescription(`Escolha uma opção abaixo para continuar...`)
                        .setFooter({ text: 'Esta interação é válida por 15 segundos.' })
                ],
                components: [
                    new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.StringSelectMenuBuilder()
                                .setCustomId('value')
                                .setPlaceholder('➡️ Escolha uma linguagem')
                                .addOptions(
                                    { emoji: '🇧🇷', label: 'Português', description: 'Clique aqui para definir sua linguagem como Português', value: "portugues" },
                                    { emoji: '🇺🇸', label: 'English', description: 'Click here to set your language to English', value: "english" },
                                    { emoji: '🇪🇸', label: 'Espanõl', description: 'Haga clic aquí para configurar su idioma a español', value: "espanol" }
                                )
                        )
                ],
                ephemeral: true
            })

            const filter = i => i.member.id === interaction.user.id;
            const collector = msg.createMessageComponentCollector({ filter, time: 15000 });

            const interactionReply = await new Promise(resolve => {
                collector.on('collect', interactionReply => {
                    collector.stop();
                    resolve(interactionReply);
                });
            });

            const this_language = interactionReply.values[0];

            dbUsers.set(`${interaction.user.id}.language`, this_language)

            let language_text = {}

            switch (this_language) {
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

            return interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setDescription(`<a:success:1081135243811110962> | Sua linguagem foi definiada como \`${language_text.text}\``)
                ],
                components: [],
                ephemeral: true
            })
        } else if (interaction.isButton() && interaction.customId === "change_privacity") {
            var user_db = dbUsers.get(`${interaction.user.id}`);
            var plans_db = dbPlans.get(`${user_db.plan}`);
            var bots_db = dbBots.get(`${interaction.user.id}`);

            await interaction.deferUpdate({ ephemeral: true });
            const msg = await interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setColor(config.embed_color.embed_invisible)
                        .setDescription(`Escolha uma opção abaixo para continuar...`)
                        .setFooter({ text: 'Esta interação é válida por 15 segundos.' })
                ],
                components: [
                    new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.StringSelectMenuBuilder()
                                .setCustomId('value')
                                .setPlaceholder('➡️ Escolha uma opção')
                                .addOptions(
                                    { emoji: '🌐', label: 'Público', description: 'Escolha essa opção para manter o perfil público', value: "public" },
                                    { emoji: '🔒', label: 'Privado', description: 'Escolha essa opção para manter o perfil privado', value: "private" }
                                )
                        )
                ],
                ephemeral: true
            })

            const filter = i => i.member.id === interaction.user.id;
            const collector = msg.createMessageComponentCollector({ filter, time: 15000 });

            let private_is = user_db.private_profile;

            const interactionReply = await new Promise(resolve => {
                collector.on('collect', interactionReply => {
                    collector.stop();
                    resolve(interactionReply);
                });
            });

            interactionReply.values[0] === "public" ? private_is = false : private_is = true
            dbUsers.set(`${interactionReply.user.id}.private_profile`, private_is);

            user_db = dbUsers.get(`${interaction.user.id}`);

            return interaction.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setDescription(`<a:success:1081135243811110962> | Sua privacidade foi definiada como \`${private_is ? 'Privado' : 'Público'}\``)
                ],
                components: [],
                ephemeral: true
            })
        } else if (interaction.isButton() && interaction.customId === "change_description") {
            var user_db = dbUsers.get(`${interaction.user.id}`);
            var plans_db = dbPlans.get(`${user_db.plan}`);
            var bots_db = dbBots.get(`${interaction.user.id}`);

            const modal = new Discord.ModalBuilder()
                .setCustomId('change_description')
                .setTitle(`Alterar descrição`)

            const description = new Discord.TextInputBuilder()
                .setCustomId('description')
                .setLabel('Digite a sua nova descrição')
                .setRequired(true)
                .setMaxLength(50)
                .setStyle(1)
                .setPlaceholder(`${user_db.description ? user_db.description : '📰 Sem nada a diser!'}`);

            modal.addComponents(
                new Discord.ActionRowBuilder().addComponents(description)
            );

            await interaction.showModal(modal);

            const submitted = await interaction.awaitModalSubmit({ time: 60000, filter: i => i.user.id === interaction.user.id });

            if (!submitted) return;
            const description_field = submitted.fields.getTextInputValue("description")
            dbUsers.set(`${interaction.user.id}.description`, description_field);

            user_db = dbUsers.get(`${interaction.user.id}`);

            await submitted.deferUpdate({ ephemeral: true });
            return submitted.editReply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setColor(config.embed_color.embed_invisible)
                        .setAuthor({ name: `${interaction.user.tag} (${interaction.user.id})`, iconURL: `${interaction.user.displayAvatarURL({ dynamic: true })}` })
                        .setThumbnail(`${interaction.user.displayAvatarURL({ dynamic: true })}`)
                        .setDescription(`Escolha uma opção abaixo para alterar seu perfil!`)
                        .addFields(
                            { name: 'Linguagem', value: `\`${user_db.language}\`` },
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
}