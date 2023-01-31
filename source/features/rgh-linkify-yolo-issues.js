const issueCells = document.querySelectorAll('td:nth-child(2)');
for (const issueCell of issueCells) {
  const link = document.createElement('a');
  link.href = getRghIssueUrl(issueCell.textContent);
  link.textContent = issueCell.textContent;
  issueCell.textContent = '';
  issueCell.appendChild(link);
}
