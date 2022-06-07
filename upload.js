
import { create } from "ipfs-http-client";
import { lstatSync, readdirSync, readFileSync, writeFileSync } from "fs"

const client = create({
    url: 'https://ipfs.infura.io:5001/api/v0',
});

const from = "./800x800/tokens";

(async () => {
    try {
        const files = readdirSync(from);
        const metadataList = [];
        //create metadata
        for (const file of files) {
            const path = from + "/" + file;
            if (lstatSync(path).isDirectory()) continue
            const { cid } = await client.add(readFileSync(path))
            const part = file.split('.')[0]
            console.log(`${file}: `, cid)
            const metadata = { image: `ipfs://${cid}`, name: `CryptoOwl${part}`, description: `An ancient CryptoOwl${part} that can be used to reconstruct the all-powerful CryptoOwl` };
            writeFileSync(`${from}/metadata/${part}.json`, JSON.stringify(metadata))
            metadataList.push(metadata)
        }

        //upload metadata
        const r = []
        for await (const data of await uploadERC721Many(metadataList)) {
            r.push(data)
        }
        const { cid } = r[r.length - 1];
        console.log(`path: ${cid}`)
    } catch (err) {

        console.log(err)
    }
})();

export async function uploadERC721Many(
    metadataList,
) {
    return client.addAll(
        //@ts-ignore
        metadataList.map((m, i) => {
            return { path: `${i}.json`, content: JSON.stringify(m) };
        }),
        { wrapWithDirectory: true },
    );
}

const path = "Qma4WJuQEykmYwh9iqzd2zPMU3sZa2SHJDpMfNBEJfCfMD"