// commands/setup-reactionroles.js
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  StringSelectMenuBuilder,
  ButtonStyle,
  MessageFlags
} = require('discord.js');
const ReactionRole = require('../../models/reactionroles/schema');
const { v4: uuidv4 } = require('uuid');
const checkPermissions = require('../../utils/checkPermissions');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-reactionroles')
    .setDescription('Manage reaction role systems')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand(subcommand =>
      subcommand
        .setName('create')
        .setDescription('Create a new reaction role setup')
        .addChannelOption(option =>
          option.setName('channel')
            .setDescription('Channel to send the reaction role message')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('List all reaction role setups in this server')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('delete')
        .setDescription('Delete a reaction role setup')
        .addStringOption(option =>
          option.setName('setup_id')
            .setDescription('The setup ID to delete')
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('addrole')
        .setDescription('Add a role to an existing reaction role setup')
        .addChannelOption(option =>
          option.setName('channel')
            .setDescription('Channel containing the reaction role message')
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName('message_id')
            .setDescription('Message ID of the reaction role embed')
            .setRequired(true)
        )
        .addRoleOption(option =>
          option.setName('role')
            .setDescription('The role to add')
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName('label')
            .setDescription('Button/Menu label for the role')
            .setRequired(true)
            .setMaxLength(80)
        )
        .addStringOption(option =>
          option.setName('emoji')
            .setDescription('Emoji for the role (optional)')
            .setRequired(false)
        )
        .addStringOption(option =>
          option.setName('description')
            .setDescription('Description for menu (optional)')
            .setRequired(false)
            .setMaxLength(100)
        )
        .addStringOption(option =>
          option.setName('style')
            .setDescription('Button style (Primary/Secondary/Success/Danger)')
            .setRequired(false)
            .addChoices(
              { name: 'Primary', value: 'Primary' },
              { name: 'Secondary', value: 'Secondary' },
              { name: 'Success', value: 'Success' },
              { name: 'Danger', value: 'Danger' }
            )
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('removerole')
        .setDescription('Remove a role from an existing reaction role setup')
        .addChannelOption(option =>
          option.setName('channel')
            .setDescription('Channel containing the reaction role message')
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName('message_id')
            .setDescription('Message ID of the reaction role embed')
            .setRequired(true)
        )
        .addRoleOption(option =>
          option.setName('role')
            .setDescription('The role to remove')
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
        if (!await checkPermissions(interaction)) return;
    switch (subcommand) {
      case 'create':
        await this.handleCreate(interaction);
        break;
      case 'list':
        await this.handleList(interaction);
        break;
      case 'delete':
        await this.handleDelete(interaction);
        break;
      case 'addrole':
        await this.handleAddRole(interaction);
        break;
      case 'removerole':
        await this.handleRemoveRole(interaction);
        break;
    }
  },

  async handleCreate(interaction) {
    const channel = interaction.options.getChannel('channel');
    
    if (!channel.isTextBased()) {
      return interaction.reply({
        content: '❌ Please select a text channel.',
        flags: MessageFlags.Ephemeral
      });
    }

    // Create setup in database
    const setupId = uuidv4();
    const setup = new ReactionRole({
      setupId,
      guildId: interaction.guild.id,
      channelId: channel.id,
      messageId: '', // Will be set after message is sent
      title: '',
      description: '',
      color: '#6366f1',
      type: '',
      menuConfig: {
        placeholder: 'Select your roles...',
        minValues: 1,
        maxValues: 1
      },
      roles: [],
      createdBy: interaction.user.id,
      updatedBy: interaction.user.id
    });

    // Create initial embed
    const embed = new EmbedBuilder()
      .setTitle('🔧 Reaction Role Setup')
      .setDescription('**Step-by-step setup:**\n\n1️⃣ Set title and color\n2️⃣ Set description\n3️⃣ Choose type (buttons/menu)\n4️⃣ Add roles (up to 5)\n5️⃣ Finish setup')
      .setColor('#6366f1')
      .setFooter({
        text: `Setup ID: ${setupId} • Click buttons below to configure`,
        iconURL: interaction.guild.iconURL()
      })
      .setTimestamp();

    // Create setup management buttons
    const setupButtons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`rr_setup_title_${setupId}`)
          .setLabel('1. Title & Color')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('📝'),
        new ButtonBuilder()
          .setCustomId(`rr_setup_description_${setupId}`)
          .setLabel('2. Description')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('📄'),
        new ButtonBuilder()
          .setCustomId(`rr_setup_type_${setupId}`)
          .setLabel('3. Type')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('⚙️'),
        new ButtonBuilder()
          .setCustomId(`rr_setup_addrole_${setupId}`)
          .setLabel('4. Add Role')
          .setStyle(ButtonStyle.Success)
          .setEmoji('➕')
      );

    const actionButtons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`rr_setup_finish_${setupId}`)
          .setLabel('5. Finish Setup')
          .setStyle(ButtonStyle.Success)
          .setEmoji('✅')
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId(`rr_setup_cancel_${setupId}`)
          .setLabel('Cancel')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('❌')
      );

    const message = await channel.send({
      embeds: [embed],
      components: [setupButtons, actionButtons]
    });

    setup.messageId = message.id;
    await setup.save();

    await interaction.reply({
      content: `✅ Reaction role setup started in ${channel}!\n\n**Setup ID:** \`${setupId}\`\n\nFollow the steps on the message to configure your reaction roles.`,
      flags: MessageFlags.Ephemeral
    });
  },

  async handleList(interaction) {
    const setups = await ReactionRole.find({ guildId: interaction.guild.id });

    if (setups.length === 0) {
      return interaction.reply({
        content: '❌ No reaction role setups found in this server.',
        flags: MessageFlags.Ephemeral
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('📋 Reaction Role Setups')
      .setColor('#3b82f6')
      .setTimestamp();

    const setupsList = setups.map(setup => {
      const channel = interaction.guild.channels.cache.get(setup.channelId);
      const channelText = channel ? `<#${channel.id}>` : 'Unknown Channel';
      
      return `**${setup.title || 'Untitled Setup'}**\n` +
             `ID: \`${setup.setupId}\`\n` +
             `Channel: ${channelText}\n` +
             `Roles: ${setup.roles.length}/5\n` +
             `Type: ${setup.type || 'Not set'}\n` +
             `Stats: ${setup.stats.totalInteractions} interactions`;
    }).join('\n\n');

    embed.setDescription(setupsList);

    await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral
    });
  },

  async handleDelete(interaction) {
    const setupId = interaction.options.getString('setup_id');
    const setup = await ReactionRole.findOne({
      setupId,
      guildId: interaction.guild.id
    });

    if (!setup) {
      return interaction.reply({
        content: '❌ Setup not found.',
        flags: MessageFlags.Ephemeral
      });
    }

    // Delete the message if it exists
    const channel = interaction.guild.channels.cache.get(setup.channelId);
    if (channel) {
      const message = await channel.messages.fetch(setup.messageId).catch(() => null);
      if (message) {
        await message.delete().catch(() => {});
      }
    }

    // Delete from database
    await ReactionRole.deleteOne({ _id: setup._id });

    await interaction.reply({
      content: `✅ Reaction role setup **${setup.title || 'Untitled'}** has been deleted.`,
      flags: MessageFlags.Ephemeral
    });
  },

  async handleAddRole(interaction) {
    const channel = interaction.options.getChannel('channel');
    const messageId = interaction.options.getString('message_id');
    const role = interaction.options.getRole('role');
    const label = interaction.options.getString('label');
    const emojiInput = interaction.options.getString('emoji') || null;
    const description = interaction.options.getString('description') || null;
    const style = interaction.options.getString('style') || 'Secondary';

    const setup = await ReactionRole.findOne({
      messageId,
      guildId: interaction.guild.id
    });

    if (!setup) {
      return interaction.reply({
        content: '❌ Reaction role setup not found. Please check the message ID.',
        flags: MessageFlags.Ephemeral
      });
    }

    if (setup.roles.length >= 5) {
      return interaction.reply({
        content: '❌ Maximum of 5 roles allowed per setup.',
        flags: MessageFlags.Ephemeral
      });
    }

    // Check if role already exists
    if (setup.roles.some(r => r.roleId === role.id)) {
      return interaction.reply({
        content: '❌ This role is already in the setup.',
        flags: MessageFlags.Ephemeral
      });
    }

    // Parse emoji
    let emoji = null;
    if (emojiInput) {
      const customEmojiMatch = emojiInput.match(/<(?:a)?:([a-zA-Z0-9_]+):(\d+)>/);
      if (customEmojiMatch) {
        emoji = {
          name: customEmojiMatch[1],
          id: customEmojiMatch[2],
          animated: emojiInput.startsWith('<a:'),
          unicode: false
        };
      } else if (emojiInput.match(/^\d+$/)) {
        const guildEmoji = interaction.guild.emojis.cache.get(emojiInput);
        if (guildEmoji) {
          emoji = {
            name: guildEmoji.name,
            id: guildEmoji.id,
            animated: guildEmoji.animated,
            unicode: false
          };
        }
      } else {
        emoji = {
          name: emojiInput,
          unicode: true
        };
      }
    }

    // Validate style
    const validStyles = ['Primary', 'Secondary', 'Success', 'Danger'];
    const finalStyle = validStyles.includes(style) ? style : 'Secondary';

    // Add role to setup
    setup.roles.push({
      roleId: role.id,
      roleName: role.name,
      label,
      description,
      emoji,
      style: finalStyle
    });

    setup.updatedBy = interaction.user.id;
    await setup.save();

    // Update the message if it exists
    const targetChannel = interaction.guild.channels.cache.get(setup.channelId);
    if (targetChannel) {
      const message = await targetChannel.messages.fetch(setup.messageId).catch(() => null);
      if (message) {
        const components = this.buildFinalComponents(setup);
        const embed = new EmbedBuilder()
          .setTitle(setup.title)
          .setDescription(setup.description)
          .setColor(setup.color)
          .setImage(setup.image)
          .setFooter({
            text: `React with the ${setup.type} below to get your roles!`,
            iconURL: interaction.guild.iconURL()
          })
          .setTimestamp();

        await message.edit({
          embeds: [embed],
          components
        });
      }
    }

    await interaction.reply({
      content: `✅ Added role **${role.name}** to the setup! (${setup.roles.length}/5)`,
      flags: MessageFlags.Ephemeral
    });
  },

  async handleRemoveRole(interaction) {
    const channel = interaction.options.getChannel('channel');
    const messageId = interaction.options.getString('message_id');
    const role = interaction.options.getRole('role');

    const setup = await ReactionRole.findOne({
      messageId,
      guildId: interaction.guild.id
    });

    if (!setup) {
      return interaction.reply({
        content: '❌ Reaction role setup not found. Please check the message ID.',
        flags: MessageFlags.Ephemeral
      });
    }

    // Check if role exists in setup
    const roleIndex = setup.roles.findIndex(r => r.roleId === role.id);
    if (roleIndex === -1) {
      return interaction.reply({
        content: '❌ This role is not in the setup.',
        flags: MessageFlags.Ephemeral
      });
    }

    // Remove role from setup
    setup.roles.splice(roleIndex, 1);
    setup.updatedBy = interaction.user.id;
    await setup.save();

    // Update the message if it exists
    if (channel) {
      const message = await channel.messages.fetch(setup.messageId).catch(() => null);
      if (message) {
        const components = this.buildFinalComponents(setup);
        const embed = new EmbedBuilder()
          .setTitle(setup.title)
          .setDescription(setup.description)
          .setColor(setup.color)
          .setImage(setup.image)
          .setFooter({
            text: `React with the ${setup.type} below to get your roles!`,
            iconURL: interaction.guild.iconURL()
          })
          .setTimestamp();

        await message.edit({
          embeds: [embed],
          components
        });
      }
    }

    await interaction.reply({
      content: `✅ Removed role **${role.name}** from the setup! (${setup.roles.length}/5)`,
      flags: MessageFlags.Ephemeral
    });
  },

  buildFinalComponents(setup) {
    if (setup.type === 'buttons') {
      const rows = [];
      let currentRow = new ActionRowBuilder();
      let buttonsInRow = 0;

      for (const roleConfig of setup.roles) {
        if (buttonsInRow >= 5) {
          rows.push(currentRow);
          currentRow = new ActionRowBuilder();
          buttonsInRow = 0;
        }

        const button = new ButtonBuilder()
          .setCustomId(`rr_role_${roleConfig.roleId}`)
          .setLabel(roleConfig.label)
          .setStyle(ButtonStyle[roleConfig.style] || ButtonStyle.Secondary);

        if (roleConfig.emoji) {
          if (roleConfig.emoji.unicode) {
            button.setEmoji(roleConfig.emoji.name);
          } else {
            button.setEmoji(roleConfig.emoji.id);
          }
        }

        currentRow.addComponents(button);
        buttonsInRow++;
      }

      if (buttonsInRow > 0) {
        rows.push(currentRow);
      }

      return rows;
    } else {
      const options = setup.roles.map(roleConfig => {
        const option = {
          label: roleConfig.label,
          value: roleConfig.roleId,
          description: roleConfig.description || `Toggle the ${roleConfig.roleName} role`
        };

        if (roleConfig.emoji) {
          if (roleConfig.emoji.unicode) {
            option.emoji = roleConfig.emoji.name;
          } else {
            option.emoji = {
              id: roleConfig.emoji.id,
              name: roleConfig.emoji.name
            };
          }
        }

        return option;
      });

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`rr_menu_${setup.setupId}`)
        .setPlaceholder(setup.menuConfig.placeholder || 'Select roles to toggle')
        .setMinValues(setup.menuConfig.minValues || 1)
        .setMaxValues(setup.menuConfig.maxValues || 1)
        .addOptions(options);

      return [new ActionRowBuilder().addComponents(selectMenu)];
    }
  },

  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    const setups = await ReactionRole.find({
      guildId: interaction.guild.id
    }).limit(25);

    const filtered = setups.filter(setup =>
      (setup.title && setup.title.toLowerCase().includes(focusedValue.toLowerCase())) ||
      setup.setupId.toLowerCase().includes(focusedValue.toLowerCase())
    );

    await interaction.respond(
      filtered.map(setup => ({
        name: `${setup.title || 'Untitled'} (${setup.roles.length} roles)`,
        value: setup.setupId
      }))
    );
  }
};
