const {
  SlashCommandBuilder,
  EmbedBuilder,
  Permissions,
} = require("discord.js");
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
            .setDescription(
              "The user you want to check the attendance of. If blank, then the user will be you."
            )
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("subtract")
        .setDescription("Subtract hours from a user")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user you want subtract hours from.")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("hours")
            .setDescription(
              "How many hours you want to subtract. (Decimals allowed)"
            )
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

      const secondsPutIn = Math.min(
        currentUnixTime - attendDBEntry.date,
        25200
      );

      await Attend.findOneAndUpdate(
        {
          discordID: interaction.user.id,
        },
        {
          checkedIn: false,
          $inc: { timePutIn: secondsPutIn },
          $push: {
            logs: {
              checkedIn: attendDBEntry.date,
              checkedOut: currentUnixTime,
            },
          },
        }
      );

      const channel = await interaction.guild.channels.fetch(
        process.env.CHANNEL_ID
      );

      channel.send(
        `👋 - <@${
          interaction.user.id
        }> has just checked out at <t:${currentUnixTime}:F>\nTo undo this do \`/attend subtract user:866367023265349662 hours:${(
          secondsPutIn / 3600
        ).toFixed(4)}\``
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
      const user = interaction.options.getUser("user") || interaction.user;

      const attendDBEntry = await Attend.findOne({
        discordID: user.id,
      });

      if (!attendDBEntry) {
        return interaction.reply({
          content: `No data available for this user.`,
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setColor("#A31F36")
        .setTitle(user.username)
        .setDescription(`<@${user.id}>`)
        .addFields(
          {
            name: "User ID",
            value: "```" + user.id + "```",
          },
          {
            name: "Checked In RN",
            value: "```" + (attendDBEntry.checkedIn ? "YES" : "NO") + "```",
          },
          {
            name: "Hours Put In",
            value:
              "```" +
              (attendDBEntry.timePutIn / 7200).toFixed(4) +
              " Hours" +
              "```",
          },
          {
            name: "Logs (Past 10)",
            value: attendDBEntry.logs
              .sort((a, b) => b.checkedOut - a.checkedOut)
              .slice(0, 10)
              .map((o) =>
                !o.checkedIn
                  ? ""
                  : `<t:${o.checkedIn}:F> - <t:${o.checkedOut}:F>`
              )
              .join("\n"),
          }
        )
        .setThumbnail(interaction.user.avatarURL())
        .setFooter({
          text: "rambot",
        });

      return interaction.reply({ embeds: [embed] });
    } else if (interaction.options.getSubcommand() == "subtract") {
      if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) {
        return interaction.reply({
          content: "You do not have permission to subtract time from people.",
          ephemeral: true,
        });
      }

      const { id } = interaction.options.getUser("user");
      const attendDBEntry = await Attend.findOne({
        discordID: id,
      });

      if (!attendDBEntry) {
        return interaction.reply({
          content: `No data available for this user.`,
          ephemeral: true,
        });
      }

      const hours = parseFloat(interaction.options.getString("hours"));
      const seconds = hours * 3600;

      await Attend.findOneAndUpdate(
        {
          discordID: id,
        },
        {
          $inc: { timePutIn: 0 - seconds },
        }
      );

      const channel = await interaction.guild.channels.fetch(
        process.env.CHANNEL_ID
      );

      channel.send(
        `🔄 - <@${interaction.user.id}> subtracted ${hours.toFixed(
          4
        )} hours from <@${id}>`
      );

      return interaction.reply({
        content: `You have subtracted ${hours} hours from <@${id}>`,
        ephemeral: true,
      });
    }
  },
};
