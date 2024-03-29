const Discord = require("discord.js")
const config = require('../../config.json');

module.exports = {
    name: "perfil", // Coloque o nome do comando
    description: "[Usuário] Comando para gerenciar uma aplicação!", // Coloque a descrição do comando
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'user',
            type: 6,
            description: 'Ver perfil de outra pessoa',
            require: false
        },
    ],

    run: async (client, interaction) => {
        const user = interaction.options.getUser('user') || interaction.user;
        const user_db = dbUsers.get(`${user.id}`);

        if (user.bot) return interaction.reply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setColor(config.embed_color.embed_invisible)
                    .setAuthor({ name: `${user.tag} (${user.id})`, iconURL: `${user.displayAvatarURL({ dynamic: true })}` })
                    .setDescription(`<a:error:1081135065389600778> | Lamento informar que aplicativos robôs, como o ${user}, não possuem um perfil associado a eles.`)
            ],
            ephemeral: true
        })

        if (user.id !== `${interaction.user.id}` && user_db.private_profile) return interaction.reply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setColor(config.embed_color.embed_invisible)
                    .setAuthor({ name: `${user.tag} (${user.id})`, iconURL: `${user.displayAvatarURL({ dynamic: true })}` })
                    .setDescription(`<a:error:1081135065389600778> | Infelizmente o usuário ${user} optou por manter sue perfil privado para que outros usuários não possam ver seu perfil!`)
            ],
            ephemeral: true
        })

        const plans_db = dbPlans.get(`${user_db.plan}`);
        const bots_db = dbBots.get(`${user.id}`)

        let ram_using = 0;

        if (bots_db && bots_db.length > 0) {
            for (let i = 0; i < bots_db.length; i++) {
                ram_using += bots_db[i].ram;
            }
        }

        user["member"] = interaction.guild.members.cache.get(user.id);

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

        await interaction.reply({
            embeds: [new Discord.EmbedBuilder()
                .setColor(config.embed_color.embed_invisible)
                .setAuthor({ name: `${user.tag} (${user.id})`, iconURL: `${user.displayAvatarURL({ dynamic: true })}` })
                .setThumbnail(`${user.displayAvatarURL({ dynamic: true })}`)
                .setDescription(`${user_db.description ? user_db.description : '📰 Sem nada a diser!'}`)
                .addFields(
                    { name: '<:id:1081380844280750202> Plano', value: `\`${user_db.plan.charAt(0).toUpperCase() + user_db.plan.slice(1).toLowerCase()}\``, inline: true },
                    { name: `${language_text.flag} Idioma`, value: `\`${language_text.text}\``, inline: true },
                    { name: '🚫 Blacklist', value: `\`${user_db.blacklist ? 'Sim' : 'Não'}\``, inline: true },
                    { name: '🤖 Aplicações', value: `\`${bots_db && bots_db.length > 0 ? bots_db.length : 0}/${plans_db.max_bot} app's\``, inline: true },
                    { name: '🌐 Websites', value: `\`Não disponível\``, inline: true },
                    { name: '<:ram:1081549712513044520> Memória RAM', value: `\`${ram_using}/${plans_db.max_ram}MB\``, inline: true },
                )
                .setFooter({ text: `${user.member.roles.cache.get(config.roles_configurations.role_support) ? `Este usuário é verificado e faz parte da equipe ${interaction.guild.name}` : `Feito com muito ❤️ por ${interaction.guild.name}`}`, iconURL: `${interaction.guild.iconURL({ dynamic: true })}` })
            ],
            ephemeral: true
        })
    }
}