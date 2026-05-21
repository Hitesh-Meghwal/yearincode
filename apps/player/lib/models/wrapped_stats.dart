// Mirrors apps/web/lib/types.ts > WrappedStats.
// Keep field names in sync with the TS type.

class WrappedStats {
  final String username;
  final String avatarUrl;
  final int year;
  final String generatedAt;
  final DateRange dateRange;

  final int totalCommits;
  final int totalAdditions;
  final int totalDeletions;
  final int netLines;
  final int totalRepos;
  final int totalActiveDays;

  final int peakHour;
  final int peakHourCommits;
  final int peakDayOfWeek;
  final double weekendRatio;
  final Streak longestStreak;

  final List<LanguageStat> topLanguages;
  final List<RepoStat> topRepos;
  final List<CollaboratorStat> topCollaborators;

  final Archetype archetype;

  final CommitMessageMarker longestCommitMessage;
  final CommitMessageMarker shortestCommitMessage;
  final CommitMessageCounts totalCommitMessages;

  const WrappedStats({
    required this.username,
    required this.avatarUrl,
    required this.year,
    required this.generatedAt,
    required this.dateRange,
    required this.totalCommits,
    required this.totalAdditions,
    required this.totalDeletions,
    required this.netLines,
    required this.totalRepos,
    required this.totalActiveDays,
    required this.peakHour,
    required this.peakHourCommits,
    required this.peakDayOfWeek,
    required this.weekendRatio,
    required this.longestStreak,
    required this.topLanguages,
    required this.topRepos,
    required this.topCollaborators,
    required this.archetype,
    required this.longestCommitMessage,
    required this.shortestCommitMessage,
    required this.totalCommitMessages,
  });

  factory WrappedStats.fromJson(Map<String, dynamic> json) {
    return WrappedStats(
      username: json['username'] as String,
      avatarUrl: (json['avatarUrl'] as String?) ?? '',
      year: (json['year'] as num).toInt(),
      generatedAt: (json['generatedAt'] as String?) ?? '',
      dateRange: DateRange.fromJson(
          (json['dateRange'] as Map?)?.cast<String, dynamic>() ?? {}),
      totalCommits: (json['totalCommits'] as num? ?? 0).toInt(),
      totalAdditions: (json['totalAdditions'] as num? ?? 0).toInt(),
      totalDeletions: (json['totalDeletions'] as num? ?? 0).toInt(),
      netLines: (json['netLines'] as num? ?? 0).toInt(),
      totalRepos: (json['totalRepos'] as num? ?? 0).toInt(),
      totalActiveDays: (json['totalActiveDays'] as num? ?? 0).toInt(),
      peakHour: (json['peakHour'] as num? ?? 0).toInt(),
      peakHourCommits: (json['peakHourCommits'] as num? ?? 0).toInt(),
      peakDayOfWeek: (json['peakDayOfWeek'] as num? ?? 0).toInt(),
      weekendRatio: (json['weekendRatio'] as num? ?? 0).toDouble(),
      longestStreak: Streak.fromJson(
          (json['longestStreak'] as Map?)?.cast<String, dynamic>() ?? {}),
      topLanguages: ((json['topLanguages'] as List?) ?? const [])
          .map((e) => LanguageStat.fromJson((e as Map).cast<String, dynamic>()))
          .toList(),
      topRepos: ((json['topRepos'] as List?) ?? const [])
          .map((e) => RepoStat.fromJson((e as Map).cast<String, dynamic>()))
          .toList(),
      topCollaborators: ((json['topCollaborators'] as List?) ?? const [])
          .map((e) =>
              CollaboratorStat.fromJson((e as Map).cast<String, dynamic>()))
          .toList(),
      archetype: Archetype.fromJson(
          (json['archetype'] as Map?)?.cast<String, dynamic>() ?? {}),
      longestCommitMessage: CommitMessageMarker.fromJson(
          (json['longestCommitMessage'] as Map?)?.cast<String, dynamic>() ?? {}),
      shortestCommitMessage: CommitMessageMarker.fromJson(
          (json['shortestCommitMessage'] as Map?)?.cast<String, dynamic>() ?? {}),
      totalCommitMessages: CommitMessageCounts.fromJson(
          (json['totalCommitMessages'] as Map?)?.cast<String, dynamic>() ?? {}),
    );
  }
}

class DateRange {
  final String from;
  final String to;
  const DateRange({required this.from, required this.to});
  factory DateRange.fromJson(Map<String, dynamic> json) => DateRange(
        from: (json['from'] as String?) ?? '',
        to: (json['to'] as String?) ?? '',
      );
}

class Streak {
  final int days;
  final String from;
  final String to;
  const Streak({required this.days, required this.from, required this.to});
  factory Streak.fromJson(Map<String, dynamic> json) => Streak(
        days: (json['days'] as num? ?? 0).toInt(),
        from: (json['from'] as String?) ?? '',
        to: (json['to'] as String?) ?? '',
      );
}

class LanguageStat {
  final String name;
  final int commits;
  final double percentage;
  const LanguageStat({
    required this.name,
    required this.commits,
    required this.percentage,
  });
  factory LanguageStat.fromJson(Map<String, dynamic> json) => LanguageStat(
        name: (json['name'] as String?) ?? '',
        commits: (json['commits'] as num? ?? 0).toInt(),
        percentage: (json['percentage'] as num? ?? 0).toDouble(),
      );
}

class RepoStat {
  final String name;
  final int commits;
  final bool isPrivate;
  const RepoStat({
    required this.name,
    required this.commits,
    required this.isPrivate,
  });
  factory RepoStat.fromJson(Map<String, dynamic> json) => RepoStat(
        name: (json['name'] as String?) ?? '',
        commits: (json['commits'] as num? ?? 0).toInt(),
        isPrivate: (json['isPrivate'] as bool?) ?? false,
      );
}

class CollaboratorStat {
  final String username;
  final int sharedCommits;
  const CollaboratorStat({
    required this.username,
    required this.sharedCommits,
  });
  factory CollaboratorStat.fromJson(Map<String, dynamic> json) =>
      CollaboratorStat(
        username: (json['username'] as String?) ?? '',
        sharedCommits: (json['sharedCommits'] as num? ?? 0).toInt(),
      );
}

class Archetype {
  final String id;
  final String name;
  final String emoji;
  final String description;
  final String rarity; // common | uncommon | rare | legendary
  const Archetype({
    required this.id,
    required this.name,
    required this.emoji,
    required this.description,
    required this.rarity,
  });
  factory Archetype.fromJson(Map<String, dynamic> json) => Archetype(
        id: (json['id'] as String?) ?? 'default',
        name: (json['name'] as String?) ?? 'The Builder',
        emoji: (json['emoji'] as String?) ?? '🔨',
        description: (json['description'] as String?) ?? '',
        rarity: (json['rarity'] as String?) ?? 'common',
      );
}

class CommitMessageMarker {
  final String text;
  final String sha;
  final String repo;
  const CommitMessageMarker({
    required this.text,
    required this.sha,
    required this.repo,
  });
  factory CommitMessageMarker.fromJson(Map<String, dynamic> json) =>
      CommitMessageMarker(
        text: (json['text'] as String?) ?? '',
        sha: (json['sha'] as String?) ?? '',
        repo: (json['repo'] as String?) ?? '',
      );
}

class CommitMessageCounts {
  final int exclamations;
  final int questions;
  final int allCaps;
  const CommitMessageCounts({
    required this.exclamations,
    required this.questions,
    required this.allCaps,
  });
  factory CommitMessageCounts.fromJson(Map<String, dynamic> json) =>
      CommitMessageCounts(
        exclamations: (json['exclamations'] as num? ?? 0).toInt(),
        questions: (json['questions'] as num? ?? 0).toInt(),
        allCaps: (json['allCaps'] as num? ?? 0).toInt(),
      );
}
