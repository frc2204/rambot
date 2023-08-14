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
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("subtract")
        .setDescription("Subtract hours from a user (ADMIN ONLY)")
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
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Add hours for a user (ADMIN ONLY)")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user you want add hours for.")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("hours")
            .setDescription(
              "How many hours you want to add. (Decimals allowed)"
            )
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("force_check_out")
        .setDescription("Force's a person's check out. (ADMIN ONLY)")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("User you want to check out")
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    return require("./subcommands/" + interaction.options.getSubcommand())(
      interaction
    );
  },
};
