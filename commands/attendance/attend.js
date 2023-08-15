const { SlashCommandBuilder } = require("discord.js");

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
    ),
  async execute(interaction) {
    return require("./subcommands/" + interaction.options.getSubcommand())(
      interaction
    );
  },
};
