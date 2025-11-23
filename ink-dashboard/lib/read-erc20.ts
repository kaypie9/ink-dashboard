export async function readErc20Balance(
  rpcUrl: string,
  token: string,
  wallet: string
): Promise<number> {
  try {
    const body = {
      id: 1,
      jsonrpc: "2.0",
      method: "eth_call",
      params: [
        {
          to: token,
          data: "0x70a08231000000000000000000000000" + wallet.slice(2),
        },
        "latest",
      ],
    }

    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    if (!data.result) return 0

    return Number(BigInt(data.result)) / 1e18
  } catch (e) {
    return 0
  }
}
