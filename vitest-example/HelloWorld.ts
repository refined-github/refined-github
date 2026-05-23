export default function HelloWorld({ name }: { name: string }): HTMLDivElement {
  const parent = document.createElement('div')

  const h1 = document.createElement('h1')
  h1.textContent = 'Hello ' + name + '!'
  parent.appendChild(h1)

  return parent
}
