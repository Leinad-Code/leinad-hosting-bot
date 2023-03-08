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
        const bots_db = dbBots.get(`${interaction.user.id}`)
    }
}