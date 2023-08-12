const {
  SlashCommandBuilder,
  EmbedBuilder,
  Permissions,
} = require("discord.js");
const keyv = require("../../schemas/keyv");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("secret_word")
    .setDescription("Change the secret word")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("change")
        .setDescription("Change today's secret word")
        .addStringOption((option) =>
          option
            .setName("secret_word")
            .setDescription(
              "The secret word. If blank, then automatically chosen."
            )
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("get").setDescription("Get today's secret word")
    ),
  async execute(interaction) {
    if (!interaction.member.permissions.has("MANAGE_SERVER")) {
      return interaction.reply({
        content: "You do not have permission to change the secret word.",
        ephemeral: true,
      });
    }

    if (interaction.options.getSubcommand() == "change") {
      var word = interaction.options.getString("secret_word");

      if (!word) {
        const response = await fetch(
          "https://random-word-api.herokuapp.com/word"
        );
        const data = await response.json();
        word = data[0];
      }

      const date = Math.floor(Date.now() / 1000);

      await keyv.findOneAndUpdate(
        {
          key: "secretword",
        },
        {
          value: {
            word,
            date,
          },
        },
        {
          upsert: true,
          new: true,
        }
      );

      const embed = new EmbedBuilder()
        .setAuthor({
          name: interaction.user.username,
          iconURL: interaction.user.avatarURL(),
          url: "https://rambots.org",
        })
        .setTitle("Secret word has changed!")
        .setDescription(`The secret word has changed to **\`${word}\`**.`);

      return interaction.reply({ embeds: [embed], ephemeral: true });
    } else if (interaction.options.getSubcommand() == "get") {
      const dbEntry = await keyv.findOne({
        key: "secretword",
      });

      const embed = new EmbedBuilder()
        .setAuthor({
          name: interaction.user.username,
          iconURL: interaction.user.avatarURL(),
          url: "https://rambots.org",
        })
        .setTitle("Secret word")
        .setDescription(
          `The secret word is **\`${dbEntry.value.word}\`**.\nIt was last changed **<t:${dbEntry.value.date}:R>**.`
        );

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
