// Demo WrappedStats used when no `?stats=` URL param is present.
// Lets `flutter run -d chrome` start the player without external data.
const Map<String, dynamic> demoStatsJson = {
  'username': 'octocat',
  'avatarUrl': '',
  'year': 2026,
  'generatedAt': '2026-05-21T00:00:00.000Z',
  'dateRange': {
    'from': '2025-05-21T00:00:00.000Z',
    'to': '2026-05-21T00:00:00.000Z',
  },
  'totalCommits': 1247,
  'totalAdditions': 84231,
  'totalDeletions': 12108,
  'netLines': 72123,
  'totalRepos': 23,
  'totalActiveDays': 184,
  'peakHour': 2,
  'peakHourCommits': 312,
  'peakDayOfWeek': 3,
  'weekendRatio': 0.22,
  'disciplineScore': 78,
  'longestStreak': {
    'days': 23,
    'from': '2025-09-12',
    'to': '2025-10-04',
  },
  'topLanguages': [
    {'name': 'TypeScript', 'commits': 421, 'percentage': 33.8},
    {'name': 'Rust', 'commits': 287, 'percentage': 23.0},
    {'name': 'Python', 'commits': 198, 'percentage': 15.9},
    {'name': 'Go', 'commits': 142, 'percentage': 11.4},
    {'name': 'Dart', 'commits': 88, 'percentage': 7.1},
  ],
  'topRepos': [
    {'name': 'octocat/atomic-engine', 'commits': 412, 'isPrivate': true},
    {'name': 'octocat/dotfiles', 'commits': 218, 'isPrivate': false},
    {'name': 'octocat/yearincode', 'commits': 184, 'isPrivate': true},
    {'name': 'octocat/sandbox', 'commits': 96, 'isPrivate': false},
    {'name': 'octocat/notes', 'commits': 41, 'isPrivate': true},
  ],
  'topCollaborators': [
    {'username': 'monalisa', 'sharedCommits': 84},
    {'username': 'spectre', 'sharedCommits': 31},
    {'username': 'hubot', 'sharedCommits': 12},
  ],
  'archetype': {
    'id': 'night-owl-refactorer',
    'name': 'The Night Owl Refactorer',
    'emoji': '🦉',
    'description':
        'Your best ideas come after midnight, when the rest of the world is asleep and the linter is the only thing watching.',
    'rarity': 'uncommon',
  },
  'longestCommitMessage': {
    'text': 'refactor: extract token pipeline into its own module',
    'sha': 'abc123',
    'repo': 'octocat/atomic-engine',
  },
  'shortestCommitMessage': {
    'text': 'wip',
    'sha': 'def456',
    'repo': 'octocat/sandbox',
  },
  'totalCommitMessages': {
    'exclamations': 12,
    'questions': 5,
    'allCaps': 3,
  },
};
