import Command from '@oclif/command'

export function parseNameAndVersion(
  nameAndVersion: string,
  command: Command
): {
  squidName: string
  versionName: string
} {
  if (
    (nameAndVersion.match(/.+@.+/gi) || []).length === 0 ||
    (nameAndVersion.match(/@/g) || []).length !== 1
  ) {
    command.error(
      'Required format: <name>@<version>. Symbol @ not allowed in names'
    )
  }
  const squidName = nameAndVersion.split('@')[0]
  const versionName = nameAndVersion.split('@')[1]
  return { squidName, versionName }
}
