[← Voltar para PROJECT.md](../PROJECT.md)

# html/plugins/mask

<a id="MaskPlugin"></a>
#### [`MaskPlugin`](../../src/html/plugins/mask/model.ts#L14) _(class)_

MaskPlugin
Não reimplementa lógica de máscara — delega inteiramente ao MaskUtils já
existente e testado. O plugin só adapta: guarda o texto raw (sem máscara)
como fonte de verdade e o texto exibido como derivado dele, notificando
assinantes quando o texto exibido muda. Se a lógica de máscara mudar,
muda em MaskUtils; este plugin não precisa saber.
