const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("admin")
    .setDescription("Record your attendance for today")
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
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({
        content: "You do not have permission to add time for people.",
        ephemeral: true,
      });
    }

    return require("./subcommands/" + interaction.options.getSubcommand())(
      interaction
    );
  },
};
