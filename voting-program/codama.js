import { createCodamaConfig } from 'gill'

export default createCodamaConfig({
  clientJs: 'client/js/generated',
  idl: 'target/idl/voting.json',
})
