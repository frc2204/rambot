const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Attend = require("../../schemas/attend");
const keyv = require("../../schemas/keyv");
require("dotenv").config({ path: "../../.env" });

const matchesToday = (op1, op2) =>
  new Date(op1 * 1000).toISOString().slice(0, 10) ===
  new Date(op2 * 1000).toISOString().slice(0, 10);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("attend")
    .setDescription("Record your attendance for today")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("check_in")
        .setDescription("Check in for today")
        .addStringOption((option) =>
          option
            .setName("secret_word")
            .setDescription("Today's secret word")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("check_out").setDescription("Check out for today")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("info")
        .setDescription("Check the attendance info for a user")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user you want to check the attendance of.")
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    const currentUnixTime = Math.floor(Date.now() / 1000);
    if (interaction.options.getSubcommand() == "check_in") {
      const secretword = await keyv.findOne({ key: "secretword" });

      if (
        interaction.options.getString("secret_word") !=
        secretword.value.word.toLowerCase()
      ) {
        return interaction.reply({
          content:
            "That secret word is wrong!\nAsk leadership for today's secret word.",
          ephemeral: true,
        });
      }

      const attendDBEntry = await Attend.findOne({
        discordID: interaction.user.id,
      });

      if (attendDBEntry) {
        if (attendDBEntry.checkedIn) {
          return interaction.reply({
            content: `You already checked in today, **<t:${attendDBEntry.date}:R>**.\nYou can check out by doing **\`/attend check_out\`**`,
            ephemeral: true,
          });
        }

        if (matchesToday(attendDBEntry.date, currentUnixTime)) {
          return interaction.reply({
            content: `You can only check in once everyday!`,
            ephemeral: true,
          });
        }

        if (matchesToday(attendDBEntry.date, secretword.value.date)) {
          return interaction.reply({
            content: `The secret word seems to be outdated. Ask leadership to make a new secret word.`,
            ephemeral: true,
          });
        }
      }

      await Attend.findOneAndUpdate(
        {
          discordID: interaction.user.id,
        },
        {
          date: currentUnixTime,
          checkedIn: true,
          $push: { logs: currentUnixTime },
        },
        {
          upsert: true,
          new: true,
        }
      );

      const channel = await interaction.guild.channels.fetch(
        process.env.CHANNEL_ID
      );

      channel.send(
        `✅ - <@${interaction.user.id}> has just checked in at <t:${currentUnixTime}:F>`
      );

      const embed = new EmbedBuilder()
        .setColor("#00ff1e")
        .setAuthor({
          name: "Successfully Checked In",
          iconURL:
            "https://cdn.discordapp.com/attachments/1031787835587563564/1139761520859947028/1134-verified-animated.gif",
          url: "https://rambots.org",
        })
        .setDescription(
          "Your attendance today has been recorded and you have successfully checked in."
        )
        .setFooter({
          text: interaction.user.username,
          iconURL: interaction.user.avatarURL(),
        });

      return interaction.reply({ embeds: [embed], ephemeral: true });
    } else if (interaction.options.getSubcommand() == "check_out") {
      const attendDBEntry = await Attend.findOne({
        discordID: interaction.user.id,
      });

      if (!attendDBEntry || !attendDBEntry.checkedIn) {
        return interaction.reply({
          content: `You have not even checked in. Why do you want to check out? 💀\nYou can do **\`/attend check_in\`** to check in.`,
          ephemeral: true,
        });
      }

      await Attend.findOneAndUpdate(
        {
          discordID: interaction.user.id,
        },
        {
          checkedIn: false,
          timePutIn: { $inc: currentUnixTime - attendDBEntry.date },
        }
      );

      const channel = await interaction.guild.channels.fetch(
        process.env.CHANNEL_ID
      );

      channel.send(
        `👋 - <@${interaction.user.id}> has just checked out at <t:${currentUnixTime}:F>`
      );

      const embed = new EmbedBuilder()
        .setColor("#00ff1e")
        .setAuthor({
          name: "Successfully Checked Out",
          iconURL:
            "https://cdn.discordapp.com/attachments/1031787835587563564/1139761521308741672/wavegif_1860.gif",
          url: "https://rambots.org",
        })
        .setDescription("Your have successfully checked out.")
        .setFooter({
          text: interaction.user.username,
          iconURL: interaction.user.avatarURL(),
        });

      return interaction.reply({ embeds: [embed], ephemeral: true });
    } else if (interaction.options.getSubcommand() == "info") {
      const embed = new EmbedBuilder()
        .setColor("#A31F36")
        .setAuthor({
          name: "Successfully Checked Out",
          iconURL:
            "https://cdn.discordapp.com/attachments/1031787835587563564/1139761521308741672/wavegif_1860.gif",
          url: "https://rambots.org",
        })
        .setDescription("Your have successfully checked out.")
        .setFooter({
          text: interaction.user.username,
          iconURL: interaction.user.avatarURL(),
        });

      return interaction.reply({ embeds: [embed] });
    }
  },
};
